import request from "supertest";
import httpStatus from "http-status";
import fse from "fs-extra";

import app from "../src/app";

describe("Test app.ts", () => {
  describe("Test check node environment endpoint", () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test("Should get development in node environment", async () => {
      process.env.NODE_ENV = "development";
      const appModule = await import("../src/app");
      const res = await request(appModule.default).get(`/nodeEnv`);

      expect(res.statusCode).toEqual(httpStatus.OK);
      expect(res.body).toHaveProperty("environment");
      expect(res.body.environment).toEqual("development");
    });

    test("Should get production in node environment", async () => {
      process.env.NODE_ENV = "production";
      const appModule = await import("../src/app");
      const res = await request(appModule.default).get(`/nodeEnv`);

      expect(res.statusCode).toEqual(httpStatus.OK);
      expect(res.body).toHaveProperty("environment");
      expect(res.body.environment).toEqual("production");
    });
  });

  describe("Test upload file endpoint", () => {
    const dummyInvoiceMetadata = {
      description: "Invoice factoring",
      external_url: "http://demo123.xyz",
      name: "dummy_75_EXP14JAN2023_100",
      attributes: [
        { value: "Current value: 75" },
        { value: "Face value: 100" },
        {
          display_type: "date",
          trait_type: "issued date",
          value: 1665733638,
        },
        {
          display_type: "date",
          trait_type: "maturity date",
          value: 1673625600,
        },
      ],
      image: "http://localhost:3000/dummy_image.jpg",
    };
    const dummyFile = `${__dirname}/testFiles/dummy_metadata.json`;
    const dummyFileName = "dummy_metadata.json";
    beforeEach(() => {
      jest.resetModules();
      // Create file if not already exist
      try {
        fse.readJSONSync(dummyFile);
      } catch {
        fse.outputFileSync(dummyFile, JSON.stringify(dummyInvoiceMetadata));
      }
    });

    afterAll(() => jest.setTimeout(5 * 1000));

    test("Should upload file to API server in development environment", async () => {
      process.env.NODE_ENV = "development";
      process.env.FILE_DEST = `${__dirname}/../artifacts/test`;
      const appModule = await import("../src/app");

      const res = await request(appModule.default)
        .post(`/upload`)
        .attach("file", dummyFile);

      expect(res.statusCode).toEqual(httpStatus.OK);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("file");
      expect(res.body.data).toHaveProperty("url");
      expect(res.body.data.file).toEqual(dummyFileName);
      expect(res.body.data.url).toEqual(
        `http://localhost:3000/${dummyFileName}`
      );
    });

    // Disable by default. Use to test on POST API for IPFS
    // test("Should upload file to IPFS via Filebase in production environment", async () => {
    //   jest.setTimeout(100 * 1000);
    //   process.env.NODE_ENV = "production";
    //   process.env.FILEBASE_BUCKET = "hyinvoicefactoringtest";
    //   const appModule = await import("../src/app");

    //   const res = await request(appModule.default)
    //     .post(`/upload`)
    //     .attach("file", dummyFile);

    //   expect(res.statusCode).toEqual(httpStatus.OK);
    //   expect(res.body).toHaveProperty("data");
    //   expect(res.body.data).toHaveProperty("file");
    //   expect(res.body.data).toHaveProperty("url");
    //   expect(res.body.data.file).toEqual(dummyFileName);
    //   expect(res.body.data.url).toContain("ipfs");
    // });

    test("Should fail to upload file as pass in non-exist file", async () => {
      process.env.NODE_ENV = "development";
      process.env.FILE_DEST = `${__dirname}/../artifacts/test`;
      const appModule = await import("../src/app");

      const res = await request(appModule.default)
        .post(`/upload`)
        .send({ file: "NonExistFile.txt" });

      expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("Test invalid endpoints", () => {
    test("Catch invalid endpoints", async () => {
      const res1 = await request(app).get("/");

      expect(res1.statusCode).toEqual(httpStatus.NOT_FOUND);
      expect(res1.body.message).toEqual("url path : / does not exist");

      const res2 = await request(app).get("/notExist");

      expect(res2.statusCode).toEqual(httpStatus.NOT_FOUND);
      expect(res2.body.message).toEqual("url path : /notExist does not exist");

      const res3 = await request(app).get("/helloWorld");

      expect(res3.statusCode).toEqual(httpStatus.NOT_FOUND);
      expect(res3.body.message).toEqual(
        "url path : /helloWorld does not exist"
      );
    });
  });
});
