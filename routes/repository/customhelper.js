const fs = require('fs');
const moment = require('moment')
const LINQ = require('node-linq').LINQ;

//#region READ & WRITE JSON FILES
exports.ReadJSONFile = function (filepath) {
    // console.log(`Read JSON file: ${filepath}`);
    var data = fs.readFileSync(filepath, 'utf-8');
    // console.log(`Contents: ${data}`);
    return JSON.parse(data);
};

exports.GetFolderList = function (dir) {
    console.log(`Content: ${dir}`);
    var data = fs.readdirSync(dir);
    return data;
};

exports.GetFiles = function (dir) {
    //console.log(`Content: ${dir}`);
    var data = fs.readdirSync(dir);
    return data;
};

exports.CreateJSON = (filenamepath, data) => {
    console.log(`Create JSON Path: ${filenamepath} Content: ${data}`);
    fs.writeFileSync(filenamepath, data, (err) => {
        return err;
    })
};

exports.CreateFolder = (dir) => {
    //console.log(`Create folder: ${dir}`);
    if (fs.existsSync(dir)) {
        //console.log(`Path exist: ${dir}`);
        return 'exist';
    } else {
        //console.log(`Create path: ${dir}`);
        fs.mkdirSync(dir);
        return 'create';
    }

};

exports.RequestDetails = (data) => {
    console.log(`Request Details Extract: ${data}`);
    var result = [];
    data.forEach((k, i) => {
        result.push({
            store: k.store,
            ticket: k.ticket,
            brandname: k.brandname,
            itemtype: k.itemtype,
            quantity: k.quantity,
            remarks: k.remarks,
        });
    });
    return result;
};

//equipments item type
exports.Distinct = (data, indetifier, target) => {
    //console.log(`Data: ${data} \nTarget: ${brandname}`);
    var unique = [];

    if (indetifier == 'itemtype') { // itemtype
        unique = data.map((item) => {
            if (item.brandname == target) {
                return item.itemname;
            }
        });
    }

    if (indetifier == 'brandname') { // itemtype
        unique = [...new Set(data.map(item => item.brandname))];
    }

    return unique;
};

exports.MoveFile = (origin, destination) => {
    fs.renameSync(origin, destination);
    console.log(`Moved ${origin} to ${destination}`);
}

//#endregion

//#region  DATETIME
exports.GetCurrentYear = () => {
    return moment().format('YYYY');
}

exports.GetCurrentMonth = () => {
    return moment().format('MM');
}

exports.GetCurrentDay = () => {
    return moment().format('DD');
}

exports.GetCurrentDate = () => {
    return moment().format('YYYY-MM-DD');
}

exports.GetCurrentDatetime = () => {
    return moment().format('YYYY-MM-DD HH:mm');
}

exports.GetCurrentDatetimeSecconds = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

exports.GetCurrentTime = () => {
    return moment().format('HH:mm');
}

exports.GetCurrentTimeSeconds = () => {
    return moment().format('HH:mm:ss');
}
//#endregion

//#region  SUMMARY REPORTS
exports.GetCablingEquipmentSummary = (target_folder) => {
    var data = [];
    let folders = this.GetFolderList(target_folder);

    folders.forEach(folder => {
        let targetDir = `${target_folder}${folder}`;
        var files = this.GetFiles(targetDir)

        files.forEach(file => {
            let filename = `${targetDir}/${file}`;
            jsonData = this.ReadJSONFile(filename);

            jsonData.forEach((key, item) => {
                data.push({
                    itemname: key.itemtype,
                    itemcount: key.itemcount
                })
            });
        })
    })

    return data;
}

exports.GetRequestSummary = (it, tranfer, cabling) => {
    var data = [];
    let itequipmentrequest = fs.readdirSync(it);
    let transferequipmentrequest = fs.readdirSync(tranfer);
    let cablingequipmentrequest = fs.readdirSync(cabling);

    data.push({
        itrequest: itequipmentrequest.length,
        transfer: transferequipmentrequest.length,
        cablingrequest: cablingequipmentrequest.length,
    })

    return data;
}

exports.GetDetailedEquipmentSummary = (masterItemsDir, equipmentDir, department) => {
    try {
        let data;
        let filter = [];
        let itemsArr = this.GetFiles(masterItemsDir);
        let folders = this.GetFolderList(equipmentDir);

        console.log(`${masterItemsDir} - ${equipmentDir}`);

        let items_filter = new LINQ(itemsArr).Where((item) => {
            return item.includes(department);
        }).OrderBy((item) => { return item }).ToArray();

        items_filter.forEach(item => {
            let itemname = item.split("_");
            filter.push(itemname[0]);
        });

        //read all json files in equipment folder on each folders
        ReadAllJSONFiles = (folders, root) => {
            let filesArr = [];
            folders.forEach(folder => {
                let targetFolder = `${root}${folder}`;
                let files = this.GetFiles(targetFolder);

                files.forEach(file => {
                    filesArr.push({
                        file: file
                    });
                })
            })

            return filesArr;
        }
        //get item counts
        GetItemCountSummary = (files, filter) => {
            let items = [];

            console.log(itemsArr);

            filter.forEach(item => {
                let arr = new LINQ(files).Where((t) => {
                    return t.file.includes(item);
                }).OrderBy((t) => { return t.file }).ToArray();

                items.push({
                    itemname: item,
                    itemcount: arr.length
                })
            })

            console.log(items);

            return items;
        }

        let files = ReadAllJSONFiles(folders, equipmentDir);

        console.log(files);

        data = GetItemCountSummary(files, filter);

        console.log(data);

        return data;

    } catch (error) {
        throw error;
    }

}

exports.GetEquipmentSummary = (target_folder) => {
    var data = [];
    let folders = this.GetFolderList(target_folder);

    folders.forEach(folder => {
        let targetFolder = `${target_folder}${folder}`;
        var files = fs.readdirSync(targetFolder);
        data.push({
            itemname: folder,
            itemcount: files.length
        })
    })

    return data;
}
//#endregion

//#region 
exports.UpdateCablingItemCount = (target_file, itemcount) => {
    let file = this.ReadJSONFile(target_file);
    let data = [];

    console.log(`TARGET FILE: ${target_file} DEDUCTION: ${itemcount}`);
    let difference = 0;
    file.forEach((key, item) => {
        let current_count = parseFloat(key.itemcount);
        let deduct = parseFloat(itemcount);
        difference = current_count - deduct;
        let dataJson;

        console.log(`${current_count} - ${deduct}`);

        data.push({
            brandname: key.brandname,
            itemtype: key.itemtype,
            itemcount: difference,
            updateby: key.updateby,
            updatedate: key.updatedate,
            createdby: key.createdby,
            createddate: key.createddate
        });


        dataJson = JSON.stringify(data, null, 2);
        this.CreateJSON(target_file, dataJson);
    });
}
//#endregion