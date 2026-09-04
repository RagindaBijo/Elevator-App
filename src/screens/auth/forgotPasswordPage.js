// Helper function to create JSON responses
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

// Helper function to generate a random number
const generateRandomNumber = (min, max) => {
  if (isNaN(min) || isNaN(max) || min > max) {
    throw new Error("Invalid parameters");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to update or insert a random number in D1 (with logging)
const updateNumberInD1 = async (env, randomNumber) => {
  console.log("Attempting to update number in D1:", randomNumber);
  const existing = await env.DB.prepare(
    "SELECT id FROM numbers ORDER BY id DESC LIMIT 1"
  ).first();

  if (existing) {
    await env.DB.prepare(
      "UPDATE numbers SET number = ?, timestamp = ? WHERE id = ?"
    )
      .bind(randomNumber, new Date().toISOString(), existing.id)
      .run();
    console.log(`Updated number ${randomNumber} in D1 at ID ${existing.id}`);
  } else {
    await env.DB.prepare(
      "INSERT INTO numbers (number, timestamp) VALUES (?, ?)"
    )
      .bind(randomNumber, new Date().toISOString())
      .run();
    console.log(`Inserted number ${randomNumber} into D1`);
  }
  return randomNumber;
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const method = request.method;

      console.log(`Handling request: ${method} ${pathname}`);

      // --- Random Number Endpoints ---
      // Fetch the latest random number (read-only)
      if (pathname === "/get" && method === "GET") {
        console.log("Fetching latest number from D1");
        const latest = await env.DB.prepare(
          "SELECT number FROM numbers ORDER BY id DESC LIMIT 1"
        ).first();
        if (latest) {
          return jsonResponse({ number: latest.number });
        } else {
          return jsonResponse({ number: null }, 404);
        }
      }

      // Generate a new random number (explicit action)
      if (pathname === "/generate" && method === "GET") {
        console.log("Generating new random number");
        const min = parseInt(url.searchParams.get("min")) || 100;
        const max = parseInt(url.searchParams.get("max")) || 1000;
        const randomNumber = generateRandomNumber(min, max);
        await updateNumberInD1(env, randomNumber);
        return jsonResponse({ number: randomNumber });
      }

      // --- User Authentication Endpoints ---
      // Login endpoint
      if (pathname === "/login" && method === "POST") {
        console.log("Processing login request");
        const { email, password } = await request.json();
        if (!email || !password) {
          return new Response("Missing email or password", { status: 400 });
        }

        const user = await env.USER_DB.prepare(
          "SELECT id, email, password, Admin FROM users WHERE email = ?"
        )
          .bind(email)
          .first();

        if (user && user.password === password) {
          return jsonResponse({
            success: true,
            id: user.id,
            admin: user.Admin,
          });
        } else {
          return new Response("Invalid credentials", { status: 401 });
        }
      }

      // --- Email Existence Check Endpoint ---
      // Check if an email already exists
      if (pathname === "/user/check-email" && method === "GET") {
        console.log("Checking if email exists");
        const email = url.searchParams.get("email");
        if (!email) {
          return new Response("Missing email parameter", { status: 400 });
        }

        const user = await env.USER_DB.prepare(
          "SELECT 1 FROM users WHERE email = ?"
        )
          .bind(email)
          .first();

        return jsonResponse({ exists: !!user });
      }

      // --- User Management Endpoints ---
      // Create a new user
      if (pathname === "/user" && method === "POST") {
        console.log("Creating new user");
        const body = await request.json();
        const {
          id,
          name,
          surname,
          email,
          number,
          idNumber,
          profileImageUrl,
          password,
          admin,
          building,
        } = body;

        if (!id || !name || !surname || !email || !password) {
          return new Response("Missing required fields", { status: 400 });
        }

        await env.USER_DB.prepare(
          "INSERT INTO users (id, name, surname, email, number, idNumber, profileImageUrl, password, Admin, Building) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
          .bind(
            id,
            name,
            surname,
            email,
            number || null,
            idNumber || null,
            profileImageUrl || null,
            password,
            admin !== undefined ? admin : false,
            building || null
          )
          .run();

        return jsonResponse({ success: true, id });
      }

      // Fetch a user by ID
      if (pathname.startsWith("/user/") && method === "GET") {
        console.log(`Fetching user with ID: ${pathname.split("/")[2]}`);
        const id = pathname.split("/")[2];
        const user = await env.USER_DB.prepare(
          "SELECT id, name, surname, email, number, idNumber, profileImageUrl FROM users WHERE id = ?"
        )
          .bind(id)
          .first();

        if (user) {
          return jsonResponse(user);
        } else {
          return new Response("User not found", { status: 404 });
        }
      }

      // Update a user by ID
      if (pathname.startsWith("/user/") && method === "PATCH") {
        console.log(`Updating user with ID: ${pathname.split("/")[2]}`);
        const id = pathname.split("/")[2];
        const body = await request.json();
        const { name, surname, email, number, idNumber, profileImageUrl } =
          body;

        const existing = await env.USER_DB.prepare(
          "SELECT * FROM users WHERE id = ?"
        )
          .bind(id)
          .first();

        if (!existing) {
          return new Response("User not found", { status: 404 });
        }

        await env.USER_DB.prepare(
          "UPDATE users SET name = ?, surname = ?, email = ?, number = ?, idNumber = ?, profileImageUrl = ? WHERE id = ?"
        )
          .bind(
            name || existing.name,
            surname || existing.surname,
            email || existing.email,
            number || existing.number,
            idNumber || existing.idNumber,
            profileImageUrl || existing.profileImageUrl,
            id
          )
          .run();

        return jsonResponse({ success: true, id });
      }

      // Delete a user by ID
      if (pathname.startsWith("/user/") && method === "DELETE") {
        console.log(`Deleting user with ID: ${pathname.split("/")[2]}`);
        const id = pathname.split("/")[2];
        const result = await env.USER_DB.prepare(
          "DELETE FROM users WHERE id = ?"
        )
          .bind(id)
          .run();

        if (result.meta.changes > 0) {
          return jsonResponse({ success: true });
        } else {
          return new Response("User not found", { status: 404 });
        }
      }

      // --- Image Management Endpoints ---
      // Upload image to R2 and update user
      if (pathname === "/upload-image" && method === "POST") {
        console.log("Uploading image");
        const formData = await request.formData();
        const file = formData.get("file");
        const userId = formData.get("userId");

        if (!file || !userId) {
          return new Response("Missing file or userId", { status: 400 });
        }

        const key = `${userId}/profile.jpg`;
        await env.IMAGE_STORAGE.put(key, file);

        const imageUrl = `https://new-elevator-api.elevator-rand.workers.dev/image/${userId}`;
        await env.USER_DB.prepare(
          "UPDATE users SET profileImageUrl = ? WHERE id = ?"
        )
          .bind(imageUrl, userId)
          .run();

        return jsonResponse({ success: true, url: imageUrl });
      }

      // Serve image from R2 privately
      if (pathname.startsWith("/image/") && method === "GET") {
        console.log(`Serving image for user ID: ${pathname.split("/")[2]}`);
        const userId = pathname.split("/")[2];
        const key = `${userId}/profile.jpg`;
        const object = await env.IMAGE_STORAGE.get(key);

        if (object) {
          return new Response(object.body, {
            headers: {
              "Content-Type": object.httpMetadata.contentType || "image/jpeg",
            },
          });
        }
        return new Response("Image not found", { status: 404 });
      }

      // --- Default Fallback for Unhandled Routes ---
      console.log(`Unhandled route: ${pathname}, returning 404`);
      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error("Fetch error:", error);
      return new Response("Server error", { status: 500 });
    }
  },

  async scheduled(event, env, ctx) {
    try {
      console.log("Scheduler started at:", new Date().toISOString());
      const min = 100;
      const max = 1000;
      const randomNumber = generateRandomNumber(min, max);
      await updateNumberInD1(env, randomNumber);
    } catch (error) {
      console.error("Scheduled error:", error);
    }
  },
};
