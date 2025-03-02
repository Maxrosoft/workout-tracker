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

    let userId = "";
    let token = "";

    before(async () => {
        const signupPayload = {
            email: "test@test.com",
            firstName: "Test",
            lastName: "Test",
            password: "test",
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
        expect(response.body.data).to.have.property("name");
        expect(response.body.data).to.have.property("UserId");
        expect(response.body.data).to.have.property("exercises");
        expect(response.body.data.exercises.length).to.be.greaterThan(0);
    });

    after(async () => {
        if (userId) {
            await User.destroy({ where: { id: userId } });
        }
    });
});
