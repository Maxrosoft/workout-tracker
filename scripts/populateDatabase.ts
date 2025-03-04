import request from "supertest";
import express from "express";
import workoutRouter from "../src/routes/workout";
import authRouter from "../src/routes/auth";
import cookieParser from "cookie-parser";
import "dotenv/config";

const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD as string;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use(workoutRouter);

const NUM_USERS = 10;
const NUM_RECORDS = 100;
const EXERCISES_PER_WORKOUT = 5;

interface User {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

interface Workout {
    name: string;
}

interface Exercise {
    name: string;
    description: string;
    numberOfSets: number;
    repetitionsPerSet: number;
    muscleGroup: string;
}

interface Schedule {
    date: string;
    time: string;
    adminPassword: string;
}

interface Comment {
    content: string;
}

const muscleGroups = ["chest", "back", "legs", "shoulders", "arms", "core"];

const generateRandomUsers = (): User[] =>
    Array.from({ length: NUM_USERS }, (_, i) => ({
        email: `user${i + 1}@example.com`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        password: `Password123!${i + 1}`,
    }));

const generateRandomWorkouts = (): Workout[] =>
    Array.from({ length: NUM_RECORDS }, (_, i) => ({
        name: `Workout ${i + 1}`,
    }));

const generateRandomExercises = (): Exercise[] =>
    Array.from({ length: NUM_RECORDS * EXERCISES_PER_WORKOUT }, (_, i) => ({
        name: `Exercise ${i + 1}`,
        description: `Description for Exercise ${i + 1}`,
        numberOfSets: Math.floor(Math.random() * 4) + 3,
        repetitionsPerSet: Math.floor(Math.random() * 8) + 8,
        muscleGroup: muscleGroups[Math.floor(Math.random() * muscleGroups.length)],
    }));

const generateRandomSchedules = (): Schedule[] =>
    Array.from({ length: NUM_RECORDS }, () => {
        const isPast = Math.random() < 0.5;
        const randomDaysOffset = Math.floor(Math.random() * 30) * (isPast ? -1 : 1);

        return {
            date: new Date(Date.now() + randomDaysOffset * 86400000).toISOString().split("T")[0],
            time: `${Math.floor(Math.random() * 12) + 6}:00:00`,
            adminPassword: ADMIN_PASSWORD,
        };
    });

const generateRandomComments = (): Comment[] =>
    Array.from({ length: NUM_RECORDS }, (_, i) => ({
        content: `Comment number ${i + 1}`,
    }));

let userTokens: Record<string, string> = {};
let userIds: number[] = [];
let workoutIds: number[] = [];
const workoutUserRelation: Record<string, string> = {};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createUsers() {
    console.log("Creating users...");
    const users = generateRandomUsers();

    for (const user of users) {
        const res = await request(app).post("/signup").send(user);
        if (res.status === 201) {
            userIds.push(res.body.data.id);
            const cookies = res.headers["set-cookie"];

            if (Array.isArray(cookies)) {
                const tokenCookie = cookies.find((c) => c.startsWith("token="));
                if (tokenCookie) {
                    userTokens[user.email] = tokenCookie.split(";")[0].split("=")[1]!;
                }
            }

            console.log(`✔ User created: ${user.email}`);
        } else {
            console.error(`✘ Failed to create user: ${user.email}`);
        }
        // await delay(200);
    }
}

async function loginUsers() {
    console.log("Logging in users...");
    let passwordI: number = 0;
    for (const email of Object.keys(userTokens)) {
        const res = await request(app)
            .post("/login")
            .send({ email, password: `Password123!${passwordI + 1}` });

        if (res.status === 200) {
            const cookies = res.headers["set-cookie"];

            if (Array.isArray(cookies)) {
                const tokenCookie = cookies.find((c) => c.startsWith("token="));
                if (tokenCookie) {
                    userTokens[email] = tokenCookie.split(";")[0].split("=")[1]!;
                }
            }

            passwordI++;

            console.log(`✔ Logged in: ${email}`);
        } else {
            console.error(`✘ Failed to log in: ${email}`);
        }

        // await delay(200);
    }
}

async function createWorkoutsWithExercises() {
    console.log("Creating workouts with exercises...");
    const workouts = generateRandomWorkouts();
    const exercises = generateRandomExercises();

    for (let i = 0; i < NUM_RECORDS; i++) {
        const randomUserEmail = Object.keys(userTokens)[Math.floor(Math.random() * userIds.length)];
        const token = userTokens[randomUserEmail];

        const workoutPayload = {
            name: workouts[i].name,
            exercises: exercises.splice(0, EXERCISES_PER_WORKOUT),
        };

        const res = await request(app).post("/workout").set("Cookie", `token=${token}`).send(workoutPayload);

        if (res.status === 201) {
            workoutUserRelation[res.body.data.id] = randomUserEmail;
            workoutIds.push(res.body.data.id);
            console.log(`✔ Workout with exercises created: ${workoutPayload.name}`);
        } else {
            console.error(`✘ Failed to create workout`);
        }
        // await delay(200);
    }
}

async function addSchedules() {
    console.log("Adding schedules...");
    const schedules = generateRandomSchedules();

    for (let i = 0; i < workoutIds.length; i++) {
        const userEmail = workoutUserRelation[workoutIds[i]];
        const token = userTokens[userEmail];

        const res = await request(app)
            .post(`/workout/${workoutIds[i]}/schedule`)
            .set("Cookie", `token=${token}`)
            .send(schedules[i]);

        if (res.status === 200) {
            console.log(`✔ Schedule added for Workout ID: ${workoutIds[i]}`);
        } else {
            console.error(`✘ Failed to add schedule`);
        }
        // await delay(200);
    }
}

async function addComments() {
    console.log("Adding comments...");
    const comments = generateRandomComments();

    for (let i = 0; i < workoutIds.length; i++) {
        const randomUserEmail = Object.keys(userTokens)[Math.floor(Math.random() * userIds.length)];
        const token = userTokens[randomUserEmail];

        const res = await request(app)
            .post(`/workout/${workoutIds[i]}/comment`)
            .set("Cookie", `token=${token}`)
            .send(comments[i]);

        if (res.status === 201) {
            console.log(`✔ Comment added to Workout ID: ${workoutIds[i]}`);
        } else {
            console.error(`✘ Failed to add comment`);
        }
        // await delay(200);
    }
}

(async () => {
    await createUsers();
    await loginUsers();
    await createWorkoutsWithExercises();
    await addSchedules();
    await addComments();
    console.log(`✅ Database successfully populated with ${NUM_RECORDS} records per table!`);
    process.exit(1);
})();
