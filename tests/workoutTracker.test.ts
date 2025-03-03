import { expect } from "chai";
import request from "supertest";
import express from "express";
import workoutRouter from "../src/routes/workout";
import authRouter from "../src/routes/auth";
import User from "../src/models/User";
import cookieParser from "cookie-parser";

describe("Workout Tracker API", () => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(authRouter);
    app.use(workoutRouter);

    let userId: string = "";
    let token: string = "";
    let workoutId: string = "";

    before(async () => {
        const signupPayload = {
            email: "test@test.com",
            firstName: "Test",
            lastName: "Test",
            password: "1234Test",
        };

        const signupResponse: any = await request(app)
            .post("/signup")
            .set("accept", "application/json")
            .send(signupPayload);
        userId = signupResponse.body.data.id;
        const cookies = signupResponse.headers["set-cookie"];

        if (cookies) {
            token = cookies
                .find((c: string) => c.startsWith("token="))
                ?.split(";")[0]
                .split("=")[1];
        }
    });

    it("should reject weak password", async () => {
        const signupPayload = {
            email: "weak@password.com",
            firstName: "Test",
            lastName: "WeakPassword",
            password: "1234",
        };

        const response: any = await request(app)
            .post("/signup")
            .set("accept", "application/json")
            .send(signupPayload);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("error");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal(
            "Password must contain at least 8 characters, including uppercase, lowercase, numbers and must not contain spaces"
        );
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(400);
    });

    it("should create a workout", async () => {
        const workoutPayload = {
            name: "Test Workout",
            exercises: [
                {
                    name: "Do leetcode, stupid nerd!",
                    description: "1 Hard problem, 4 Medium problems, 2 Easy problems",
                    numberOfSets: 1,
                    repetitionsPerSet: 7,
                    muscleGroup: "arms",
                },
            ],
        };

        const response = await request(app)
            .post("/workout")
            .set("accept", "application/json")
            .set("Cookie", `token=${token}`)
            .send(workoutPayload);

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("success");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Workout created successfully");
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(201);

        expect(response.body).to.have.property("data");
        expect(response.body.data).to.have.property("id");

        workoutId = response.body.data.id;

        expect(response.body.data).to.have.property("name");
        expect(response.body.data).to.have.property("UserId");
        expect(response.body.data).to.have.property("exercises");
        expect(response.body.data.exercises.length).to.be.greaterThan(0);
    });

    it("should update a workout", async () => {
        const workoutPayload = {
            name: "Updated Workout",
            exercises: [
                {
                    name: "Do leetcode, stupid nerd! AGAIN, BUT MORE!",
                    description: "2 Hard problem, 8 Medium problems, 4 Easy problems",
                    numberOfSets: 2,
                    repetitionsPerSet: 7,
                    muscleGroup: "arms",
                },
            ],
        };

        const response = await request(app)
            .put(`/workout/${workoutId}`)
            .set("accept", "application/json")
            .set("Cookie", `token=${token}`)
            .send(workoutPayload);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("success");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Workout updated successfully");
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body.data).to.have.property("id");
        expect(response.body.data).to.have.property("name");
        expect(response.body.data).to.have.property("UserId");
        expect(response.body.data).to.have.property("exercises");
        expect(response.body.data.exercises.length).to.be.greaterThan(0);
    });

    it("should reject past date", async () => {
        const schedulePayload = {
            date: "2000-01-01",
            time: "00:00:00",
        };

        const response = await request(app)
            .post(`/workout/${workoutId}/schedule`)
            .set("accept", "application/json")
            .set("Cookie", `token=${token}`)
            .send(schedulePayload);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("error");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Invalid date");
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(400);
    });


    it("should add a schedule", async () => {
        const schedulePayload = {
            date: "2100-01-01",
            time: "00:00:00",
        };

        const response = await request(app)
            .post(`/workout/${workoutId}/schedule`)
            .set("accept", "application/json")
            .set("Cookie", `token=${token}`)
            .send(schedulePayload);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("success");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Schedule added successfully");
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body.data).to.have.property("id");
        expect(response.body.data).to.have.property("name");
        expect(response.body.data).to.have.property("UserId");
        expect(response.body.data).to.have.property("schedule");
        expect(response.body.data.schedule).to.have.property("date");
        expect(response.body.data.schedule).to.have.property("time");
    });

    it("should add a comment", async () => {
        const commentPayload = {
            content: "it sucks bro...",
        };
        const response = await request(app)
            .post(`/workout/${workoutId}/comment`)
            .set("accept", "application/json")
            .set("Cookie", `token=${token}`)
            .send(commentPayload);

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("success");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Comment added successfully");
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(201);

        expect(response.body).to.have.property("data");
        expect(response.body.data).to.have.property("id");
        expect(response.body.data).to.have.property("name");
        expect(response.body.data).to.have.property("UserId");
        expect(response.body.data).to.have.property("comments");
        expect(response.body.data.comments.length).to.be.greaterThan(0);
    });

    it("should delete a workout", async () => {
        const response = await request(app)
            .delete(`/workout/${workoutId}`)
            .set("accept", "application/json")
            .set("Cookie", `token=${token}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("type");
        expect(response.body.type).to.equal("success");
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Workout deleted successfully");
        expect(response.body).to.have.property("code");
        expect(response.body.code).to.equal(200);
    });

    after(async () => {
        if (userId) {
            await User.destroy({ where: { id: userId } });
        }
    });
});
