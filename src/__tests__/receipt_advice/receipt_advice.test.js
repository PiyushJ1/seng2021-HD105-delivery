describe('POST /receipt-advice', () => {

    describe('Success Cases', () => {
  
      test('Creates receipt advice successfully', async () => {
        const res = await request(app)
          .post('/receipt-advice')
          .send({
            despatchId: "DES123",
            deliveryPartyId: "DEL456",
            receivedDate: "2026-03-01",
            items: [
              {
                productId: "PROD1",
                quantityReceived: 50
              }
            ]
          });
  
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          receiptAdviceId: expect.any(String),
          status: expect.any(String),
          totalItemsReceived: 50
        });
      });
  
      test('Calculates total items received correctly', async () => {
        const res = await request(app)
          .post('/receipt-advice')
          .send({
            despatchId: "DES124",
            deliveryPartyId: "DEL456",
            receivedDate: "2026-03-01",
            items: [
              { productId: "PROD1", quantityReceived: 20 },
              { productId: "PROD2", quantityReceived: 30 }
            ]
          });
  
        expect(res.body.totalItemsReceived).toBe(50);
      });
  
    });
  
    describe('Error Cases', () => {
  
      test('Returns 400 when fields are missing', async () => {
        const res = await request(app)
          .post('/receipt-advice')
          .send({
            deliveryPartyId: "DEL456"
          });
  
        expect(res.statusCode).toBe(400);
      });
  
      test('Returns 404 when despatch not found', async () => {
        const res = await request(app)
          .post('/receipt-advice')
          .send({
            despatchId: "INVALID",
            deliveryPartyId: "DEL456",
            receivedDate: "2026-03-01",
            items: [
              {
                productId: "PROD1",
                quantityReceived: 50
              }
            ]
          });
  
        expect(res.statusCode).toBe(404);
      });
  
      test('Returns 409 for duplicate receipt advice', async () => {
        const body = {
          despatchId: "DES123",
          deliveryPartyId: "DEL456",
          receivedDate: "2026-03-01",
          items: [
            { productId: "PROD1", quantityReceived: 50 }
          ]
        };
  
        await request(app).post('/receipt-advice').send(body);
  
        const res = await request(app).post('/receipt-advice').send(body);
  
        expect(res.statusCode).toBe(409);
      });
  
    });
  
  });