import request from "supertest";
import { describe, expect, test } from "vitest";

const BASE_URL = "http://localhost:3000";

function generateId() {
    return "RA-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}
