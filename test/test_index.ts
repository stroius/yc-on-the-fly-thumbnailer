import {handler} from "../src";
import * as chai from "chai";


it('should work with ?path=64x64/vip.jpeg', async function () {
    const res = await handler({
        httpMethod: 'GET',
        queryStringParameters: {
            path: '64x64/vip.jpeg'
        }
    });
    chai.expect(res.statusCode).to.equal(200);
});
