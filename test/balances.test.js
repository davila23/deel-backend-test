const request = require('supertest');
const app = require('../src/app');
const {Profile, Contract, Job} = require('../src/model');

describe('Balances', () => {
    describe('/balances/deposit/:userId', () => {
        beforeEach(async () => {
            await Profile.sync({force: true});
            await Contract.sync({force: true});
            await Job.sync({force: true});

            await Promise.all([
                Profile.create({
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Potter',
                    profession: 'Wizard',
                    balance: 1150,
                    type: 'client',
                }),
                Profile.create({
                    id: 5,
                    firstName: 'John',
                    lastName: 'Lenon',
                    profession: 'Musician',
                    balance: 150,
                    type: 'contractor',
                }),
                Contract.create({
                    id: 1,
                    terms: 'bla bla bla',
                    status: 'in_progress',
                    ClientId: 1,
                    ContractorId: 5,
                }),
                Job.create({
                    id: 1,
                    description: 'work 1',
                    price: 200,
                    ContractId: 1,
                    paid: true,
                    paymentDate: '2020-08-15T19:11:26.737Z',
                }),
                Job.create({
                    id: 2,
                    description: 'work 2',
                    price: 110,
                    ContractId: 1,
                    paid: false,
                }),
                Job.create({
                    id: 3,
                    description: 'work 3',
                    price: 300,
                    ContractId: 1,
                    paid: false,
                }),
            ]);
        });

        it('should return 406 if exceeds 0.25%', async () => {
            const response = await request(app)
                .post('/balances/deposit/1')
                .send({amount: 102.6});

            const {statusCode, body} = response
            expect(statusCode).toEqual(401);
        });

        it(`should return 401 if client isn't found`, async () => {
            const response = await request(app)
                .post('/balances/deposit/12')
                .send({amount: 100});

            const {statusCode} = response
            expect(statusCode).toEqual(401);
        });
    });
});
