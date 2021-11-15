const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const ut = require('../lib/util.js')

function check_if_json_exists(mo_file_path, output_dir, output_format) {
	json_file_path = ut.getJsonPathFromMoPath (mo_file_path, output_dir, output_format)
	if (fs.existsSync(json_file_path)) {
		return [true, json_file_path]; 
	}
	return [false, null];
}

function get_checksum_from_json(json_file_path) {
	var checksum_from_json = null;
	try {
		var file_content = fs.readFileSync(json_file_path, 'utf8');
		var json_output = JSON.parse(file_content);
		
		// TODO: change based on new data model
		checksum_from_json = json_output['checksum'];
		if (checksum_from_json == null) {
			console.log("no checksum in current json file");
			return null;
		} 
	} catch (err) {
		console.log("Error parsing json file:", err);
		throw ("Error reading file :", err);
	}
	return checksum_from_json;
}

async function get_mo_checksum(mo_file_path) {
	//source: https://wellingguzman.com/notes/node-checksum
	return new Promise(function (resolve, reject) {
		const hash = crypto.createHash('md5');
		const input = fs.createReadStream(mo_file_path);

		input.on('error', reject);

		input.on('data', function (chunk) {
			hash.update(chunk);
		});

		input.on('close', function () {
			resolve(hash.digest('hex'));
		});
	});
}

async function main(mo_file_path, output_dir, output_format) {
	output = check_if_json_exists(mo_file_path, output_dir, output_format);

	file_exists = output[0]

	var checksum_from_json;
	if (file_exists) {
		json_file_path = output[1]
		var output = get_checksum_from_json(json_file_path=json_file_path);

		if (output != null) {
			checksum_from_json = output;
		} else {
			checksum_from_json = null;
		}
	}

	let res = await get_mo_checksum(mo_file_path)

	if (checksum_from_json != null) {
		if (res == checksum_from_json) {
			console.log("true")
		} else {
			console.log("different checksum")
		}
	} else {
		console.log("different checksum");
	}

	return res
}

var mo_file_path = '../testMo/Modulation.mo';
main(mo_file_path, 'out', 'json')