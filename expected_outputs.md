# Expected Outputs and CLI Behavior

This document describes the expected behavior and output files of the `modelica-json` parser based on the provided CLI flags.

## Glossary

- **AST (Abstract Syntax Tree)**: A structural representation of the Modelica code. 
  - `raw-json`: A detailed, complete transcription of the Modelica file.
  - `json`: A simplified version of the AST, designed to be easier to read and interpret, removing redundant structural details.
- **CXF (Control XML Format / JSON-LD)**: A specific representation of a Control Description Language (CDL) sequence of operation. It describes the control logic and the components involved in a format compatible with the OBC (Open Building Control) ecosystem.
- **CDL-Compliant**: A Modelica class that follows the ASHRAE Standard 231 (CDL) specification for control sequences.

## General Rules
- **One File per Model**: The parser generates one output file for every `.mo` file parsed (unless specified otherwise by flags like `--cxfCore`).
- **Output Folders**: 
  - `raw-json` output is saved in the `raw-json/` folder.
  - `json` output is saved in the `json/` folder.
  - `cxf` output is saved in the `cxf/` folder. The intermediate `json/` and `objects/` folders are also written.
  - `semantic` output (objects) is saved in the `objects/` folder. The intermediate `json/` folder is also written.
- **raw-json parses only the input**: `raw-json` transcribes only the file(s) given by `-f` (all `.mo` files if `-f` is a package directory). Instantiated classes are not followed, so `--elementary` has no effect, and no schema validation is performed.
- **Validation errors vs. exit code**: When a file is validated against a schema, any errors are **printed**, but the run still exits with code 0. The run **exits with code 1** only when `--validateCdlSchema` is set and validation against `schema-cdl.json` fails (or, for `-o json`, the CDL checks for `defaultComponentName` / `Documentation` raise warnings). Output files are written before the process exits.
- **CDL elementary blocks** are skipped (no output) unless `--elementary` is set, and they are never validated against `schema-cdl.json`.
- **Validation packages**: When `-f` is a package and `--cxfCore` and/or `--elementary` is set, the classes in `Validation` sub-packages are skipped (no output).

## Behavior Table

| Input File Type | Output (`-o`) | `--exportCxfFromModelica` | `--cxfCore` | `--elementary` | `--validateCdlSchema` | Expected Output / Behavior |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Modelica Model** (non-CDL) | `raw-json` | `false` | `false` | `*` | `false` | The top-level file is transcribed into `raw-json/`. No schema validation. |
| **Modelica Model** (non-CDL) | `raw-json` | `false` | `false` | `*` | `true` | **Warning**: `--validateCdlSchema` is ignored, because raw-json cannot be validated against `schema-cdl.json`. The top-level file is transcribed into `raw-json/`; exit code 0. |
| **Modelica Model** (non-CDL) | `json` | `false` | `false` | `false` | `false` | Simplified JSON for the model and all instantiated classes in `json/`; elementary blocks are skipped. Validated against `schema-modelica.json` (errors printed). |
| **Modelica Model** (non-CDL) | `json` | `false` | `false` | `true` | `false` | Same as above, including CDL elementary blocks. |
| **Modelica Model** (non-CDL) | `json` | `false` | `false` | `*` | `true` | **Exception (exit 1)**: The model is not CDL-compliant, so validation against `schema-cdl.json` fails. The JSON files are still written. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` / `semantic` | `false` | `true` | `*` | `*` | **Exception**: `cxfCore` requires the output format to be `cxf`. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` / `semantic` | `true` | `*` | `*` | `*` | **Exception**: The `--exportCxfFromModelica` flag can only be used when the output format is `cxf`. |
| **Modelica Model** (non-CDL) | `cxf` | `false` | `false` | `*` | `*` | **Exception (exit 1)**: The model is not CDL-compliant. The error names the problem (e.g. `Cannot find instance ...`) and says to use `--exportCxfFromModelica`. |
| **Modelica Model** (non-CDL) | `cxf` | `true` | `false` | `false` | `false` | CXF files (.jsonld) are generated in the `cxf/` folder for the model and the class(es) marked with `__cdl(isControls=true)`. Only the controls class(es) are validated against `schema-cdl.json` (errors printed). |
| **Modelica Model** (non-CDL) | `cxf` | `true` | `false` | `false` | `true` | Same as above. The run exits 1 only if a controls class fails `schema-cdl.json`; the model itself is not validated. |
| **Modelica Model** (non-CDL) | `cxf` | `true` | `false` | `true` | `*` | Same as the two rows above, plus CXF files for each CDL elementary block used by the controls class(es). Elementary blocks are not validated. |
| **Modelica Model** (non-CDL) | `cxf` | `true` | `false` | `*` | `*` | If no class is marked with `__cdl(isControls=true)`: **Exception (exit 1)**, because there is no controls block and the model is not CDL-compliant (it does not validate against `schema-cdl.json`). No CXF is generated; only the intermediate `json/` and `objects/` folders are written. |
| **CDL Composite Block** | `raw-json` | `false` | `false` | `*` | `false` | The top-level file is transcribed into `raw-json/`. No schema validation. |
| **CDL Composite Block** | `raw-json` | `false` | `false` | `*` | `true` | **Warning**: `--validateCdlSchema` is ignored, because raw-json cannot be validated against `schema-cdl.json`. The top-level file is transcribed into `raw-json/`; exit code 0. |
| **CDL Composite Block** | `json` | `false` | `false` | `false` | `false` | Simplified JSON for the block and its instantiated classes in `json/`; elementary blocks are skipped. Validated against `schema-modelica.json` (errors printed). |
| **CDL Composite Block** | `json` | `false` | `false` | `false` | `true` | Same as above, and also validated against `schema-cdl.json`; exit code 0 if it passes. |
| **CDL Composite Block** | `json` | `false` | `false` | `true` | `false` | Same as the row with `--elementary=false`, including CDL elementary blocks. |
| **CDL Composite Block** | `json` | `false` | `false` | `true` | `true` | Simplified JSONs including elementary blocks are generated. Non-elementary JSONs are validated against `schema-cdl.json`; elementary blocks are not validated. Exit code 0 if they pass. |
| **CDL Composite Block** | `raw-json` / `json` / `semantic` | `false` | `true` | `*` | `*` | **Exception**: `cxfCore` requires the output format to be `cxf`. |
| **CDL Composite Block** | `raw-json` / `json` / `semantic` | `true` | `*` | `*` | `*` | **Exception**: The `--exportCxfFromModelica` flag can only be used when the output format is `cxf`. |
| **CDL Composite Block** | `cxf` | `*` | `false` | `false` | `*` | CXF files (.jsonld) are generated in the `cxf/` folder. Intermediate JSONs are always validated against `schema-cdl.json` (errors printed); the run exits 1 on failure only if `--validateCdlSchema` is set. `--exportCxfFromModelica` has no effect, and the output is identical, provided the block validates against `schema-cdl.json`. Otherwise, with `--exportCxfFromModelica`, **Exception (exit 1)** as for a Modelica model without a controls block. |
| **CDL Composite Block** | `cxf` | `*` | `false` | `true` | `*` | CXF files (.jsonld) for the block and all its instantiated elementary blocks are generated in the `cxf/` folder. Validation and `--exportCxfFromModelica` as in the row above. |
| **Modelica Model** / **CDL Composite Block** | `cxf` | `*` | `true` | `*` | `*` | **Exception**: `--cxfCore` requires `-f` to be the CDL package (`.../CDL`). |
| **CDL Package** (`.../CDL`) | `cxf` | `*` | `true` | `false` | `*` | **Exception**: The `--cxfCore` flag requires the `--elementary` flag to be enabled. |
| **CDL Package** (`.../CDL`) | `cxf` | `*` | `true` | `true` | `*` | `CXF-Core.jsonld` and the CXF files for all elementary blocks are generated in the `cxf/` folder. |
| **Any Model** | `semantic` | `false` | `false` | `*` | `*` | Simplified JSONs (`json/`) and semantic information (`objects/`) are generated; elementary blocks are skipped unless `--elementary` is set. No schema validation is performed, and `--validateCdlSchema` is ignored. |
