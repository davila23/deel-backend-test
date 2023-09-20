const request = require('supertest');
const app = require('../src/app');
const {Profile, Contract, Job} = require('../src/model');

describe('Jobs', () => {
    describe('/jobs/unpaid', () => {
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
                    balance: 64,
                    type: 'contractor',
                }),
                Profile.create({
                    id: 8,
                    firstName: 'Andy',
                    lastName: 'Warp',
                    profession: 'Runner',
                    balance: 120,
                    type: 'contractor',
                }),
                Profile.create({
                    id: 199,
                    firstName: 'No contract',
                    lastName: 'guy',
                    profession: 'Tester',
                    balance: 0,
                    type: 'client',
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
                    price: 250,
                    ContractId: 1,
                    paid: false,
                }),
                Contract.create({
                    id: 2,
                    terms: 'pew pew pew',
                    status: 'terminated',
                    ClientId: 1,
                    ContractorId: 8,
                }),
                Job.create({
                    id: 3,
                    description: 'work 2',
                    price: 500,
                    ContractId: 2,
                    paid: false,
                }),
            ]);
        });

        it('should return only unpaid jobs', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body.result).toHaveLength(1);
            expect(body.result).toContainEqual(
                expect.objectContaining({
                    id: 2,
                    description: 'work 2',
                    price: 250,
                    ContractId: 1,
                })
            );
        });

        it('should return unpaid jobs only for in_progress contracts', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '8');

            expect(statusCode).toEqual(200);
            expect(body.result).toHaveLength(0);
        });

        it('should return [] when profile_id does not match client or contractor', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '199');

            expect(statusCode).toEqual(200);
            expect(body.result).toHaveLength(0);
        });
    });

    describe('/jobs/:id/pay', () => {
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
                    price: 2500,
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

        it('should fail when job is not found', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/77/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(500);
        });

        it('should mark job as paid', async () => {
            const {statusCode, body} = await request(app)
                .post('/jobs/3/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body.result).toEqual(expect.objectContaining({
                id: 3,
                description: 'work 3',
                price: 300,
                ContractId: 1,
                paid: true,
                paymentDate: expect.any(String)
            }))
        });
    });
});
