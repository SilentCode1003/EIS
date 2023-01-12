const excel = require('excel4node');
const path = require('path');
const os = require('os');
const express = require('express');
const http = require('http');
const fs = require('fs');

const app = express();
const workbook = new excel.Workbook();
const homeDir = os.homedir();
const dowloadsPath = path.join(homeDir, 'Downloads');

const excelPath = `${__dirname}/data/excel/`

exports.SaveExcel = (data, filename) => {
    return new Promise((resolve, reject) => {
        var worksheet = workbook.addWorksheet('Sheet 1');
        var row = 1;
        var col = 1;

        console.log(data);
        console.log(`data length: ${data.length}`);

        for (x = 0; x < data.length; x++) {
            console.log(`header content length: ${data[x].length}`);

            for (z = 0; z < data[x].length; z++) {
                console.log(`row: ${row} col ${col} data: ${data[x][z]}`);
                worksheet.cell(row, col).string(data[x][z]);
                col += 1;
            }

            col = 1;
            row += 1;
        }
        // var buffer = workbook.writeToBuffer();

        let filePath = `${excelPath}${filename}.xlsx`;

        workbook.write(filePath, (err, stats) => {
            if(err) reject(err);

            console.log(stats);
        });

        resolve(filePath);
    });
}
