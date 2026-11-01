# Skill Swap

Skill Swap is a website where people can offer skills, find tutors,
and exchange knowledge with others.

## Technologies Used

- HTML
- CSS
- JavaScript
- Git and GitHub

## Unit 9: Full-Stack Integration

The frontend now loads skills from the provided Express API and saves new skills to its SQLite database through Sequelize. It includes loading messages, error handling, and a retry button.

### Run the backend

Backend repository: https://github.com/Ginepo/COMPSIX-skill-swap-backend

Clone the backend into a separate folder and install its dependencies:

```bash
git clone https://github.com/Ginepo/COMPSIX-skill-swap-backend.git
cd COMPSIX-skill-swap-backend
npm install
```

Create a `.env` file in the backend folder:

```env
DB_STORAGE=./database.sqlite
PORT=3000
```

Initialize the database once, then start the server:

```bash
npm run setup
npm start
```

Check the API at http://localhost:3000/api/skills. Keep the backend running. The backend source code was not modified.

### Run the frontend

In a separate terminal, from the frontend folder:

```bash
npm install
npx --yes http-server . -p 5500 -c-1
```

Open http://localhost:5500. The API base URL is configured in `api-service.js`.

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution is blocked.

### Tests

```bash
npm test -- --runInBand
```

All 11 existing unit tests pass for category filtering, cost calculation, and skill matching.

### Manual checks

- Add a skill through Offer Your Skills, then refresh to check persistence.
- Filter by category and match skills by category and budget.
- Calculate a session cost, such as $10 × 2 hours = $20.
- Stop the backend and refresh to check the error message. Restart it and select Try again.

This project runs locally and requires both servers.