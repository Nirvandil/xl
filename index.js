const xlsx = require('xlsx');
const request = require('sync-request');
const sleep = require('thread-sleep');

const workBook = xlsx.readFile('/media/load/models_v_ak27_autosoft.xls');
const targetCells = [];
for (let i = 2; i < 1000; i++) targetCells.push('B' + i);
const unique = (item, index, self) => self.indexOf(item) === index;
const needed = item => /^[\x00-\x7F]*$/.test(item) || item.includes('Легковые');
const normalizeModelName = modelString => {
    const splitted = modelString.split(/,|, /);
    return splitted[0].split(' ')[0];
};
const sendPost = (data, address) => {
    const response = request('POST', `http://192.168.1.244/api/1.0${address}`, {
        body: JSON.stringify(data),
        gzip: false,
        headers: {
            'content-type': 'application/json',
            'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsib2F1dGgyX2lkIl0sInVzZXJfbmFtZSI6ImFkbWluaXN0cmF0b3IiLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTIzMzQ5MTM0LCJhdXRob3JpdGllcyI6WyI5MjIzMzcyMDM2ODU0Nzc1ODA3IiwiUk9MRV9BRE1JTiJdLCJqdGkiOiJlOTQ4MGE3My00ZmQwLTQ5NTAtOTVhNy04NmZmOTYyNDcxYWUiLCJjbGllbnRfaWQiOiJhbmRyb2lkIn0._EWtlvm9j_6eAQBEQ50L4NNJjJkhc0vKaOIgG0KhYrM',
        },
    });
    console.log(JSON.parse(response.getBody('utf8')));
    sleep(600);
    return JSON.parse(response.getBody('utf8'));
};
const createBrand = brand => {
    const normalize = str => str.split('-')[0];
    console.log(`Creating brand: ${normalize(brand)}`);
    const response = sendPost({name: normalize(brand)}, '/dictionary/car/brand');
    return response['id'];
};
const createModel = request => {
    console.log(`Creating model ${JSON.stringify(request)}`);
    sendPost(request, '/dictionary/car/model');
};

workBook.SheetNames
    .map(item => item.toString())
    .filter(needed)
    .map(sheetName => {
        const brandId = createBrand(sheetName);
        const brandModelData = {};
        brandModelData.brandId = brandId;
        brandModelData.models = [];
        const workSheet = workBook.Sheets[sheetName];
        targetCells.forEach(cell => {
            const cellContent = workSheet[cell];
            if (cellContent) {
                const modelString = cellContent['v'].toString();
                brandModelData.models.push(normalizeModelName(modelString));
            }
        });
        return Object.freeze(brandModelData);
    })
    .forEach(brandModelData => {
        brandModelData.models
            .filter(unique)
            .forEach(modelName => {
                const createModelRequest = {carBrandId: brandModelData.brandId, name: modelName, seats: 4};
                createModel(createModelRequest);
            })
    });
