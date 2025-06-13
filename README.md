# ♻️ ReCraft – Gamifying Sustainability & Circular Commerce

ReCraft is a gamified sustainability platform designed to promote conscious consumption through community-driven product transparency, eco-friendly marketplaces, and digital rewards. It empowers users, sellers, and administrators through separate dashboards that track impact, verify transparency, and manage sustainable commerce at scale.

![ReCraft Banner](./src/public/images/recraft-banner.png)

## 🌍 Core Idea
ReCraft brings **Reduce, Reuse, Recycle (RRR)** actions into the digital age by incentivizing eco-conscious behavior with **GreenBits**, a platform currency. It verifies product sustainability, supports local artisans, and creates a transparent, rewarding ecosystem for green living.

---

## 🚀 Key Features

### 👤 User Dashboard
- 📱 Post proof of RRR activities to earn GreenBits
- 🏅 Maintain streaks for bonus rewards
- 🧾 Scan/search products to check **TSV (Transparency Score Value)** and **SSV (Sustainability Score Value)**
- 🛒 Shop eco-friendly products from verified sellers
- 📊 Track personal carbon & waste impact
- 🥇 Leaderboard based on positive actions

### 🛍️ Seller Dashboard
- 🧾 Submit products for sustainability verification
- 📦 Manage inventory & orders
- 📈 Get analytics on buyer behavior and sales
- 🪪 Upload certifications (FSSAI, organic, recycled proof)
- 🔗 Connect with local collectors or recyclers

### 🛠️ Admin Dashboard
- ✅ Review and verify seller claims
- 🚩 Handle reports and moderation
- 📊 Access platform-wide analytics
- 📢 Broadcast messages to users/sellers
- 📝 Monitor TSV/SSV calculations and streak validations

---

## 📊 Score Definitions

- **TSV (Transparency Score Value)**: Indicates how openly a product shares sourcing & sustainability data (calculated by admin).
- **SSV (Sustainability Score Value)**: Measures the environmental impact of a product (e.g., recycled %, biodegradable %, etc.).

*Both are embedded in product QR codes for user access.*

---

## 🧠 Tech Stack

| Layer             | Technology                        |
|------------------|-----------------------------------|
| Frontend         | HTML, CSS, JavaScript, EJS        |
| Backend          | Node.js, Express.js               |
| Database         | MongoDB + Mongoose                |
| Authentication   | Passport.js                       |
| File Uploads     | Multer, Cloudinary                |
| Hosting          | Render / Vercel / MongoDB Atlas   |
| Additional Tools | Flash messages, Sessions, dotenv  |

---

## 🧪 Future Integrations

- 🤖 AI: To auto-detect sustainability scores from images/descriptions
- 🔗 Blockchain: To store transparency records immutably
- 🏛️ Government APIs: Integrate with recycling schemes and subsidies
- 🧾 Carbon Credit System: Issue carbon certificates based on user actions

---


## 🛠️ Setup Instructions

### 1. Clone the Repository
git clone https://github.com/your-username/ReCraft.git
cd ReCraft

### 2. Install Dependencies

npm install


### 3. Environment Configuration

Create a .env file with the following keys:


MONGODB_URI=mongodb://localhost:27017/recraft
SECRET=your_secret_key

### 4. Run the App

nodemon src/app.js
\`\`\`

---

## 👥 Team ReCraft


Want to contribute? Open a pull request or raise an issue!

---

## 📝 License

This project is under the [MIT License](./LICENSE). You are free to use, modify, and distribute with attribution.

---

## 🙌 Support & Feedback

Have questions or suggestions?

📧 Email: [sync.with.saksham@gmail.com](mailto:sync.with.saksham@gmail.com)

> “Recycle. Reuse. ReCraft.” – Build a better planet, one GreenBit at a time 🌱
