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
  - `cxf` output is saved in the `cxf/` folder.
  - `semantic` output (objects) is saved in the `objects/` folder.

## Behavior Table

| Input File Type | Output (`-o`) | `--exportCxfFromModelica` | `--cxfCore` | `--elementary` | `--validateCdlSchema` | Expected Output / Behavior |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Modelica Model** (non-CDL) | `raw-json` / `json` | `false` | `false` | `false` | `false` | AST files (.json) are generated in the `raw-json/` or `json/` folder. Elementary blocks are skipped. All files are validated against `schema-modelica.json`. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` | `false` | `false` | `false` | `true` | **Exception**: The process exits with an error because `validateCdlSchema` requires a CDL-compliant model. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` | `false` | `false` | `true` | `false` | AST files (.json) including CDL elementary blocks are generated in the `raw-json/` or `json/` folder. All files are validated against `schema-modelica.json`. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` | `false` | `false` | `true` | `true` | **Exception**: The process exits with an error because `validateCdlSchema` requires a CDL-compliant model. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` | `false` | `true` | `*` | `*` | **Exception**: `cxfCore` requires the output format to be `cxf` and the input file to be a CDL package. |
| **Modelica Model** (non-CDL) | `raw-json` / `json` | `true` | `*` | `*` | `*` | **Exception**: The `--exportCxfFromModelica` flag can only be used when the output format is `cxf`. |
| **Modelica Model** (non-CDL) | `cxf` | `false` | `*` | `*` | `*` | **Exception**: The model is not CDL-compliant and the `--exportCxfFromModelica` flag is missing. |
| **Modelica Model** (non-CDL) | `cxf` | `true` | `false` | `false` | `false` | CXF files (.jsonld) are generated in the `cxf/` folder for the model and any classes marked with `__cdl(isControls=true)`. No strict CDL validation is performed. |
| **Modelica Model** (non-CDL) | `cxf` | `true` | `false` | `false` | `true` | CXF files (.jsonld) are generated in the `cxf/` folder for the model and any classes marked with `__cdl(isControls=true)`. No strict CDL validation is performed. |
| **CDL Composite Block** | `raw-json` / `json` | `false` | `false` | `false` | `false` | AST files (.json) are generated in the `raw-json/` or `json/` folder. Elementary blocks are skipped. All files are validated against `schema-modelica.json`. |
| **CDL Composite Block** | `raw-json` / `json` | `false` | `false` | `false` | `true` | AST files (.json) are generated in the `raw-json/` or `json/` folder. Elementary blocks are skipped. Validated against `schema-cdl.json`. |
| **CDL Composite Block** | `raw-json` / `json` | `false` | `false` | `true` | `false` | AST files (.json) including elementary blocks are generated in the `raw-json/` or `json/` folder. All files are validated against `schema-modelica.json`. |
| **CDL Composite Block** | `raw-json` / `json` | `false` | `false` | `true` | `true` | AST files (.json) including elementary blocks are generated. Simplified JSONs are validated against `schema-cdl.json`; elementary blocks are not validated. |
| **CDL Composite Block** | `raw-json` / `json` | `false` | `true` | `*` | `*` | **Exception**: `cxfCore` requires the output format to be `cxf`. |
| **CDL Composite Block** | `raw-json` / `json` | `true` | `*` | `*` | `*` | **Exception**: The `--exportCxfFromModelica` flag can only be used when the output format is `cxf`. |
| **CDL Composite Block** | `cxf` | `*` | `false` | `false` | `*` | CXF files (.jsonld) are generated in the `cxf/` folder. Intermediate ASTs are validated against `schema-cdl.json` if `--validateCdlSchema` is true. |
| **CDL Composite Block** | `cxf` | `*` | `false` | `true` | `*` | CXF files (.jsonld) for the block and all its instantiated elementary blocks are generated in the `cxf/` folder. |
| **CDL Composite Block** | `cxf` | `*` | `true` | `false` | `*` | **Exception**: The `--cxfCore` flag requires the `--elementary` flag to be enabled. |
| **CDL Composite Block** | `cxf` | `*` | `true` | `true` | `*` | `CXF-Core.jsonld` and the CXF files for the block and its elementary blocks are generated in the `cxf/` folder. |
| **Any Model** | `semantic` | `*` | `*` | `*` | `*` | ASTs are validated against `schema-modelica.json`. Semantic information is extracted and saved in the `objects/` folder. |
