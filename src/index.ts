import * as S3 from 'aws-sdk/clients/s3';
import * as sharp from 'sharp';
import * as stream from 'stream';
import {YC} from "./yc";

/*
When you make changes to the accepted image file extensions:
    1. Change README.md
    2. Make according changes in stroius/crmkit-backend OR notify developers
 */
const re = RegExp('(\.jpg|\.png|\.jpeg)$', 'i');

const ALLOWED_DIMENSIONS = new Set();
const {AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET} = process.env;

if (process.env.ALLOWED_DIMENSIONS) {
    const dimensions = process.env.ALLOWED_DIMENSIONS.split(/\s*,\s*/);
    dimensions.forEach((dimension) => ALLOWED_DIMENSIONS.add(dimension));
}

const s3Config: S3.Types.ClientConfiguration = {
    apiVersion: '2006-03-01',
    region: 'ru-central1',
    signatureVersion: 'v4',
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    endpoint: 'storage.yandexcloud.net',
    s3ForcePathStyle: true,
};
const s3 = new S3(s3Config);


export async function handler(event: YC.CloudFunctionsHttpEvent) {
    const key = event.queryStringParameters.path;
    const match = key.match(/((\d*)x(\d*))\/(.*)/);
    const dimensions = match[1];
    const width = parseInt(match[2] || "0", 10);
    const height = parseInt(match[3] || "0", 10);
    const originalKey = match[4];

    if (ALLOWED_DIMENSIONS.size > 0 && !ALLOWED_DIMENSIONS.has(dimensions)) {
        return {
            statusCode: 403,
            headers: {},
            body: '',
        };
    }

    if (originalKey.match(re) === null) {
        return {
            statusCode: 400,
            headers: {},
            body: '',
        };
    }

    const [ext,] = originalKey.split(".").reverse()
    // As I pass through only 2 file extensions I can simply define content type as follows
    const contentType = ext.toLowerCase() == "png" ? "image/png" : "image/jpg"

    // Compile options
    var transformer_options = {fit: sharp.fit.cover}
    if (width) { transformer_options["width"] = width }
    if (height) { transformer_options["height"] = height }

    const transformer = sharp().resize(transformer_options);

    const s3GetObjectStream = s3.getObject({
        Bucket: BUCKET,
        Key: originalKey,
    }).createReadStream();

    const pass = new stream.PassThrough();

    let body: string = '';
    const bufs = [];

    pass.on('data', function (d) {
        bufs.push(d);
    });
    pass.on('end', function () {
        body = Buffer.concat(bufs).toString('base64');
    })

    const result = s3.upload({
            Bucket: BUCKET,
            Key: "thumbnails/" + key,
            Body: pass,
            ContentType: contentType
        }
    ).promise();

    s3GetObjectStream
        .pipe(transformer)
        .pipe(pass);


    await result;
    return {
        statusCode: 200,
        headers: {
            "Content-Type": contentType
        },
        isBase64Encoded: true,
        body,
    }
}
