const request = require('supertest');
const app = require('../src/app');
const { Profile, Contract, Job } = require('../src/model');

describe('Contracts', () => {

    beforeEach(async () => {
        await Profile.sync({ force: true });
        await Contract.sync({ force: true });
        await Job.sync({ force: true });

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
            Contract.create({
                id: 1,
                terms: 'bla bla bla',
                status: 'terminated',
                ClientId: 1,
                ContractorId: 5,
            })
        ]);
    });

    describe('/contracts/:id', () => {

        it('should return 401 when profile_id header is not set', async () => {
            await request(app)
                .get('/contracts/1')
                .expect(401);
        });

        it('should return 401 when profile_id header mismatch with client or contractor', async () => {
            await request(app)
                .get('/contracts/1')
                .set('profile_id', '199')
                .expect(401);
        });

        it('should return contract when profile_id header = contractor', async () => {
            const { statusCode, body } = await request(app)
                .get('/contracts/1')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body.contract).toEqual(
                expect.objectContaining({
                    id: 1,
                    terms: 'bla bla bla',
                    status: 'terminated',
                    ClientId: 1,
                    ContractorId: 5,
                })
            );
        });
    });

    describe('/contracts', () => {
        
        beforeEach(async () => {
            await Contract.create({
                id: 2,
                terms: 'bla bla bla 2',
                status: 'in_progress',
                ClientId: 1,
                ContractorId: 5,
            }),
            await Contract.create({
                id: 3,
                terms: 'bla bla bla 3',
                status: 'new',
                ClientId: 1,
                ContractorId: 5,
            });
        });

        it('should return not terminated contracts', async () => {
            const { statusCode, body } = await request(app)
                .get('/contracts')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body.contracts).toHaveLength(2);
            expect(body.contracts).toContainEqual(
                expect.objectContaining({
                    id: 2,
                    terms: 'bla bla bla 2',
                    status: 'in_progress',
                    ClientId: 1,
                    ContractorId: 5,
                })
            );
            expect(body.contracts).toContainEqual(
                expect.objectContaining({
                    id: 3,
                    terms: 'bla bla bla 3',
                    status: 'new',
                    ClientId: 1,
                    ContractorId: 5,
                })
            );
        });
    });
});
