# ♻️ ReCraft – Gamifying Sustainability & Circular Commerce

ReCraft is a gamified sustainability platform designed to promote conscious consumption through community-driven product transparency, eco-friendly marketplaces, and digital rewards. It empowers users, sellers, and administrators through separate dashboards that track impact, verify transparency, and manage sustainable commerce at scale.

![ReCraft Banner](./src/public/images/recraft-banner.png)

## 🌍 Core Idea
ReCraft brings **Reduce, Reuse, Recycle (RRR)** actions into the digital age by incentivizing eco-conscious behavior with **GreenBits**, a platform currency. It verifies product sustainability, supports local artisans, and creates a transparent, rewarding ecosystem for green living. 

---

## 🚀 Key Features

### 👤 User Dashboard
- 📱 Post proof of RRR activities to earn eco-Bits
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
git clone https://github.com/ReCrafters/Recraft.git
cd ReCraft

### 2. Install Dependencies

npm install
npm start

### 3. Environment Configuration

Create a .env file with the following keys:


MONGODB_URI=mongodb://localhost:27017/recraft
SECRET=your_secret_key
PORT=port_number
CLOUDINARY_CLOUD_NAME= cloud_name
CLOUDINARY_API_KEY= api_key 
CLOUDINARY_API_SECRET= secret_cloudinary_key

### 4. Run the App

node src/app.js


---

## 🤝 Contributors

This project acknowledges **everyone’s contribution respectfully and transparently**, based on role and responsibility.

**Organization Owner & Primary Developer**
- Saksham ([@itsme-saksham18](https://github.com/itsme-saksham18))  
  - Led the project end-to-end, including architecture design, full-stack development, UI/UX workflows, sustainability logic integrations, deployment, project documentation, and overall platform direction.

**Significant Development Collaboration**
- Payal ([@Payal1907](https://github.com/Payal1907))  
  - Contributed meaningfully to multiple frontend modules, interface refinement, component structuring, and collaborative debugging during feature implementation.

- Ankita ([@Ankita391](https://github.com/Ankita391))  
  - Assisted with early-stage conceptual discussions and helped frame the sustainability-driven approach.

- Vansh ([@Vansh12970](https://github.com/Vansh12970))  
  - Supported the brainstorming phase and contributed to shaping the initial direction of the project.

---

## 📜 License
This project is open-sourced for learning and ethical development.  
Commercial use requires explicit permission from the project owner.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




