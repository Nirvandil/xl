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
            'Authorization' : 'Bearer token',
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

const colors = 'Серебристый красный\n' +
    'Ярко-красный\n' +
    'Фиолетовый\n' +
    'Красный\n' +
    'Серебристый темно-красный\n' +
    'Красный\n' +
    'Серебристый ярко-красный\n' +
    'Серебристый темный\n' +
    'Серебристый темно-бордовый\n' +
    'Темно-красный\n' +
    'Красный металлик\n' +
    'Серебристый ярко-красный\n' +
    'Серебристый фиолетовый\n' +
    'Красный\n' +
    'Темно-бордовый\n' +
    'Белый\n' +
    'Ярко-белый\n' +
    'Белая двухслойная\n' +
    'Бежево-розовый\n' +
    'Золотой\n' +
    'Серебристо-бежевый\n' +
    'Светло-зеленый\n' +
    'Бело-желтый\n' +
    'Светло-желтый\n' +
    'Светло-бежевый\n' +
    'Серебристый серо-зеленый\n' +
    'Желтый\n' +
    'Светло-желтый\n' +
    'Серо-белый\n' +
    'Бежевый\n' +
    'Серо-бежевый\n' +
    'Золотой\n' +
    'Серебристо-золотой\n' +
    'Серебристо-бежевый\n' +
    'Серебристый желто-зеленый\n' +
    'Серебристый оранжевый\n' +
    'Сливочно-белый\n' +
    'Зеленый\n' +
    'Серо-зеленый металлик\n' +
    'Серебристый ярко-зеленый\n' +
    'Золотисто-зеленый\n' +
    'Темно-зеленый\n' +
    'Желто-зеленый\n' +
    'Серебристый темно-зеленый\n' +
    'Серо-зеленый\n' +
    'Сине-зеленый\n' +
    'Золотисто-серый\n' +
    'Серебристо-зеленый\n' +
    'Серебристый серо-зеленый\n' +
    'Серебристый коричнево-зеленый\n' +
    'Ярко-синий\n' +
    'Фиолетовый\n' +
    'Серебристый темно-фиолетовый\n' +
    'Темно-серый металлик\n' +
    'Серебристо-синий\n' +
    'Зелено-синий\n' +
    'Серебристо-голубой\n' +
    'Сине-зеленый\n' +
    'Серебристый зелено-голубой\n' +
    'Голубой\n' +
    'Серо-голубой\n' +
    'Голубой\n' +
    'Фиолетово-синий металлик\n' +
    'Серебристый сине-фиолетовый\n' +
    'Синий\n' +
    'Серебристый ярко-синий\n' +
    'Темно-голубой\n' +
    'Ярко-фиолетовый\n' +
    'Темно-синий\n' +
    'Серебристый сине-зеленый\n' +
    'Серо-фиолетовый\n' +
    'Зелено-голубой\n' +
    'Голубой\n' +
    'Серебристо-синий\n' +
    'Серебристый темно-синий\n' +
    'Темно-бежевый\n' +
    'Черный\n' +
    'Серебристо-черный\n' +
    'Серо-бежевый металлик\n' +
    'Темный серо-синий\n' +
    'Серебристый\n' +
    'Бежево-красный металлик\n' +
    'Светло-серый\n' +
    'Серебристый металлик\n' +
    'Темно-коричневый\n' +
    'Красно-коричневый\n' +
    'Коричневый\n' +
    'Зеленый';
const colorList = colors.split('\n');
const createColor = colorData => {
    sendPost(colorData, '/dictionary/car/color')
};
colorList.forEach(color => {
    createColor({name: color});
});
