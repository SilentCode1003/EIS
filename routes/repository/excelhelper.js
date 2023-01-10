const excel = require('excel4node');
const path = require('path');
const os = require('os');

const workbook = new excel.Workbook();
const homeDir = os.homedir();
const dowloadsPath = path.join(homeDir, 'Downloads');

exports.SaveExcel = (header, data, filename) => {
    return new Promise((resolve, reject) => {
        var worksheet = workbook.addWorksheet('Sheet 1');
        var row = 1;
        var col = 1;

        console.log(header.length);
        console.log(data);

        for (x = 0; x < header.length; x++) {
            console.log(header[x].length);
            for (z = 0; z < header[x].length; z++) {
                console.log(`row: ${x} col: ${z}`);
                console.log(`row: ${header[x][z]}`);
                worksheet.cell(row, z + 1).string(header[x][z]);
            }
            row += 1;
        }

        for (x = 0; x < data.length; x++) {
            console.log(data[x].length);
            for (z = 0; z < data[x].length; z++) {
                console.log(`row: ${x} col: ${z}`);
                console.log(`row: ${data[x][z]}`);
                worksheet.cell(row, z + 1).string(data[x][z]);
            }
            row += 1;
        }

        let filePath = path.join(dowloadsPath, `${filename}.xlsx`)
        workbook.write(filePath, (err, stats) => {
            if (err) reject(err);
            console.log(stats);
            resolve('Saved!');
        })
    });
}

