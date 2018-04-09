const xlsx = require('xlsx');
const request = require('sync-request');
const workBook = xlsx.readFile('/media/load/models_v_ak27_autosoft.xls');
const targetCells = [];
for (let i = 2; i < 1000; i++) targetCells.push('B' + i);
const unique = (item, index, self) => self.indexOf(item) === index;
const needed = item => /^[\x00-\x7F]*$/.test(item) || item.includes('Легковые');
const normalizeModelName = modelString => {
    const splitted = modelString.split(/,|, /);
    //console.log(`Splitted: ${splitted[0]}`);
    return splitted[0];
};
const sendPost = (data, address) => {
    const response = request('POST', `http://192.168.1.244/api/1.0${address}`, {
        body: data,
        gzip: false,
        headers: {
            'content-type': 'application/json',
            'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsib2F1dGgyX2lkIl0sInVzZXJfbmFtZSI6ImFkbWluaXN0cmF0b3IiLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTIzMzI0Nzk4LCJhdXRob3JpdGllcyI6WyI5MjIzMzcyMDM2ODU0Nzc1ODA3IiwiUk9MRV9BRE1JTiJdLCJqdGkiOiJiYzg4ZGQ4Ni04ZDY4LTRlODktOTBhNi0zZTdjMDEzMGZjNzciLCJjbGllbnRfaWQiOiJhbmRyb2lkIn0.T27HOWrXjukqHmKW3dmB4OCs09FXyS2k_W1tARm0O6g',
        },
    });
    console.log(JSON.parse(response.getBody('utf8')));
    return JSON.parse(response.getBody('utf8'))['id'];
};
const createBrand = brand => {
    const normalize = str => str.split('-')[0];
    console.log(normalize(brand));
    return sendPost(JSON.stringify({name: normalize(brand)}), '/dictionary/car/brand');
};
const createModel = request => {
    //console.log('Creating model ' + request)
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
        console.log(brandModelData);
        return Object.freeze(brandModelData);
    })
    .forEach(brandModelData => {
        brandModelData.models
            .filter(unique)
            .forEach(modelName => {
                const createModelRequest = {carBrandId: brandModelData.brandId, name: modelName, seats: 4};
                createModel(JSON.stringify(createModelRequest));
            })
    });
