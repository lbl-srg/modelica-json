# Expected Outputs and CLI Behavior

This document describes the expected behavior and output files of the `modelica-json` parser based on the provided CLI flags ([P13](#proposed-changes)). Where the implementation differs from the expected behavior, or where the behavior should be changed, the text refers to the [Proposed Changes](#proposed-changes).

## Glossary

- **AST (Abstract Syntax Tree)**: A structural representation of the Modelica code.
  - `raw-json`: The parse tree of the Modelica file, transcribed as is. See [raw-json vs. json](#raw-json-vs-json).
  - `json`: A simplified version of `raw-json`, designed to be read and processed by downstream tools. See [raw-json vs. json](#raw-json-vs-json).
- **CXF (Control XML Format / JSON-LD)**: A specific representation of a Control Description Language (CDL) sequence of operation. It describes the control logic and the components involved in a format compatible with the OBC (Open Building Control) ecosystem.
- **CDL-Compliant**: A Modelica class that follows the ASHRAE Standard 231 (CDL) specification for control sequences.
- **CDL Elementary Block**: A block provided by the CDL library (`Buildings.Controls.OBC.CDL`), as opposed to a composite block, which is built by connecting instances of other blocks. The parser does not inspect the class: it decides from the file path only (`checkIfCdlElementaryBlockOrPackage` in `lib/util.js`). A file is treated as an elementary block if its path, ignoring case, matches one of the following:
  - `<root>/Controls/OBC/CDL/<P>/<Name>.mo`, where `<P>` is one of `Conversions`, `Discrete`, `Integers`, `Interfaces`, `Logical`, `Psychrometrics`, `Reals`, `Routing`, `Types`, `Utilities`;
  - `<root>/Controls/OBC/CDL/<P>/Sources/<Name>.mo`, where `<P>` is one of `Integers`, `Logical`, `Reals`;
  - `.../CDL/Constants.mo`.

  Here `<root>` is a directory whose name contains `Buildings`. The definition therefore also covers connectors (`Interfaces`), types (`Types`), `Constants`, and the `package.mo` files of these packages. It does not cover the models in `Validation` packages, `CDL/package.mo`, or a copy of the CDL library under a root directory whose name does not contain `Buildings` ([P12](#proposed-changes)).
- **Used Class**: A class that another class depends on through a declaration. This covers the type of a component (`CDL.Reals.Add add`), the base class of an `extends` clause, the name in an `import` clause, a constraining class (`constrainedby ...`), and a type given in a `redeclare` or `replaceable` modification. Used classes are followed recursively: the classes used by a used class are also used classes. Classes that appear only inside equations or algorithms, such as functions, are not followed. With `--exportCxfFromModelica`, classes from the `Buildings` and `Modelica` libraries are not followed, unless their path contains a `Templates`, `Examples` or `Controls` package.

### raw-json vs. json

Both formats describe the same Modelica code, but they serve different purposes.

- **`raw-json`** mirrors the Modelica grammar one-to-one: each grammar rule produces a JSON object, even when it has a single child, and every optional keyword is written out with its default value (for example `"is_final": false`, `"inner": false`, `"encapsulated": false`). The result is verbose and deeply nested, so use it only if you need the exact grammar structure, for instance to develop or debug the parser.
- **`json`** is computed from `raw-json` and is the format that the `semantic` and `cxf` outputs are built from. It is the recommended format for most uses. Compared to `raw-json`, it:
  - removes the wrapper objects that have a single child, and the keywords left at their default value;
  - writes type and component names as dotted strings (`"Modelica.Units.SI.Temperature"` rather than a list of `name_parts`);
  - expands an expression into a `simple_expression` object only if it is a single function call (`abs(k)`), a relational or logical expression (`k > 1 and k < 3`), an `if` expression, or a `for` iterator, or if it contains a parenthesized sub-expression (`(k + 1)*k`). Arithmetic expressions that contain no parentheses, including those that contain function calls, are written as Modelica strings (`k*2 + 1` gives `"k*2 +1"`, `sin(k) + 1` gives `"sin(k) +1"`). The same applies at every nesting level, so the sub-expression `k + 1` in `(k + 1)*k` is written as `"k +1"` ([P14](#proposed-changes));
  - removes the escaped quotes around description strings, and stores them under `description_string` instead of `string_comment`;
  - can be validated against `schema-modelica.json` and, for CDL-compliant classes, `schema-cdl.json`;
  - is generated for the input file(s) and for all their used classes (`raw-json` covers only the input file(s), see [General Rules](#general-rules)).

**Example.** For the following Modelica file (`test/FromModelica/Parameter1.mo`):

```modelica
within FromModelica;
block Parameter1 "Some class comment"
  parameter Real kP = 1 "Some comment";
end Parameter1;
```

`raw-json` gives (formatted for readability; the actual output is on one line):

```json
{
  "within": "FromModelica",
  "final_class_definitions": [{
    "is_final": false,
    "class_definition": {
      "encapsulated": false,
      "class_prefixes": "block",
      "class_specifier": {
        "long_class_specifier": {
          "identifier": "Parameter1",
          "string_comment": "\"Some class comment\"",
          "composition": {
            "element_list": {
              "elements": [{
                "redeclare": false, "is_final": false, "inner": false, "outer": false, "replaceable": false,
                "component_clause": {
                  "type_prefix": "parameter",
                  "type_specifier": {"name": {"name_parts": [{"dot_op": false, "identifier": "Real"}]}},
                  "component_list": {
                    "component_declaration_list": [{
                      "declaration": {
                        "identifier": "kP",
                        "modification": {
                          "equal": true, "colon_equal": false,
                          "expression": {"simple_expression": {"logical_expression1": {"logical_term_list": [{
                            "logical_factor_list": [{"not": false, "relation": {"arithmetic_expression1": {
                              "arithmetic_term_list": [{"term": {"factors": [{"primary1": {
                                "unsigned_number": 1, "is_false": false, "is_true": false,
                                "function_call_primary": {"der": false, "initial": false}, "end": false
                              }}]}}]
                            }}}]
                          }]}}}
                        }
                      },
                      "comment": {"string_comment": "\"Some comment\""}
                    }]
                  }
                }
              }]
            },
            "element_sections": []
          },
          "is_extends": false
        }
      }
    }
  }],
  "modelicaFile": "test/FromModelica/Parameter1.mo",
  "checksum": "0e923225decf43f3a5d2909de067020a"
}
```

whereas `json` gives:

```json
{
  "within": "FromModelica",
  "stored_class_definitions": [{
    "class_prefixes": "block",
    "class_specifier": {
      "long_class_specifier": {
        "identifier": "Parameter1",
        "description_string": "Some class comment",
        "composition": {
          "element_list": [{
            "component_clause": {
              "type_prefix": "parameter",
              "type_specifier": "Real",
              "component_list": [{
                "declaration": {
                  "identifier": "kP",
                  "modification": {"equal": true, "expression": {"simple_expression": "1"}}
                },
                "description": {"description_string": "Some comment"}
              }]
            }
          }]
        }
      }
    }
  }],
  "modelicaFile": "test/FromModelica/Parameter1.mo",
  "fullMoFilePath": "/path/to/modelica-json/test/FromModelica/Parameter1.mo",
  "checksum": "0e923225decf43f3a5d2909de067020a"
}
```

In `raw-json`, the value `1` of `kP` is reached through `simple_expression` → `logical_expression1` → `logical_term_list` → `logical_factor_list` → `relation` → `arithmetic_expression1` → `arithmetic_term_list` → `term` → `factors` → `primary1` → `unsigned_number`. In `json`, it is simply `"simple_expression": "1"`.

## General Rules
- **One Output File per `.mo` File**: The parser generates one output file for every `.mo` file parsed (unless specified otherwise by flags like `--cxfCore`).
- **Output Folders**:
  - `raw-json` output is saved in the `raw-json/` folder.
  - `json` output is saved in the `json/` folder.
  - `cxf` output is saved in the `cxf/` folder. The intermediate `json/` and `objects/` folders are also written.
  - `semantic` output (objects) is saved in the `objects/` folder. The intermediate `json/` folder is also written.
- **raw-json parses only the input**: `raw-json` transcribes only the file(s) given by `-f` (all `.mo` files if `-f` is a package directory, [P7](#proposed-changes)). Used classes are not followed, and no schema validation is performed.
- **Validation errors vs. exit code**: When a file is validated against a schema, any errors are **printed**, but the run still exits with code 0. The run **exits with code 1** only when `--validateCdlSchema` is set and one of the following occurs:
  - validation against `schema-cdl.json` fails;
  - for `-o json` only, a parsed class is missing one of the annotations required by CDL. These annotations are not checked by `schema-cdl.json`, but by a separate check that prints an error for each missing annotation:
    - `<file> does not have "defaultComponentName".` if the class annotation has no `defaultComponentName`. This check is not performed for classes in a `Validation` or `Examples` package.
    - `<file> does not have "Documentation" section.` if the class annotation has no `Documentation`.

    These checks are not performed for `package.mo` files or for files whose path contains a `Modelica` directory ([P4](#proposed-changes)).

  Output files are written before the process exits.
- **[CDL elementary blocks](#glossary)** are parsed like any other used class, so their files are always included in `json/` and `objects/`, whatever the output. `--elementary` is accepted only with `-o cxf`, where it only controls whether CXF files are written for the elementary blocks. CDL elementary blocks are never validated against `schema-cdl.json`. The current implementation differs: it skips elementary blocks for all outputs unless `--elementary` is set ([P11](#proposed-changes)).
- **Validation packages**: When `-f` is a package and `--cxfCore` and/or `--elementary` is set, the classes in `Validation` sub-packages are skipped (no output). Since `--elementary` is accepted only with `-o cxf`, this applies to `-o cxf` only.

## Behavior Table

In this section, the *input class* is the class of the file given by `-f`. If `-f` is a package directory, each `.mo` file in it is processed as an input class (see also [Validation packages](#general-rules)). For `-o modelica`, `-f` is a JSON file instead. `<dir>` is the output directory given by `-d`. It defaults to the current directory, except for `-o doc`, `-o doc+` and `-o modelica`, which then write to a directory named `current` ([P9](#proposed-changes), [P10](#proposed-changes)).

### Argument Checks

These checks are performed in the order below, before any file is parsed. An error stops the run with exit code 1, and no output file is written. For `-o modelica`, only the first two checks are performed: the other flags are ignored without warning ([P9](#proposed-changes)).

| Condition | Result |
| :--- | :--- |
| `-o modelica` and `-f` is not a `.json` file | **Error**: `Modelica output requires the input file (-f) to be a json file.` |
| `-o` is not `modelica` and `-f` is a `.json` file | **Error**: `The json input file required only when the output format (-o) is 'modelica'.` |
| `--elementary` and `-o` is not `cxf` | **Error**: `In order to generate CXF (jsonld) of elementary blocks, -o/--output should be cxf.` This check is not implemented: on `master` its condition is never true, and this branch removed it ([P11](#proposed-changes)). |
| `--cxfCore` and `-o` is not `cxf` | **Error**: `... -o/--output should be cxf.` |
| `--cxfCore` and the `-f` path does not end with `CDL` or `cdl` | **Error**: `... -f/--file should be path/to/CDL.` |
| `--cxfCore` without `--elementary` | **Error**: `... --elementary flag must be used.` |
| `--exportCxfFromModelica` and `-o` is not `cxf` | **Error**: `The --exportCxfFromModelica flag can only be used when the output format (-o) is "cxf".` |
| `--validateCdlSchema` and `-o raw-json` | **Warning**: `--validateCdlSchema` is ignored, and the run continues ([P1](#proposed-changes)). |

### Output and Validation

The table below assumes that the argument checks pass.

- In the flag columns, ✓ means that the flag is passed, – that it is not passed, and *either* that the row applies in both cases (the effect of the flag, if any, is described in the row).
- *All files in `json/`* means every `.json` file under `<dir>/json/`, except the files whose path contains a `Modelica` directory. This includes files written by earlier runs in the same output directory ([P2](#proposed-changes)). CDL elementary blocks are never validated against `schema-cdl.json`.
- A *controls instance* is a component annotated with `__cdl(isControls=true)`, declared in the input class or in one of its used classes, or redeclared in an `extends` clause.

| Input class | `-o` | `--exportCxfFromModelica` | `--cxfCore` | `--elementary` | `--validateCdlSchema` | Output | Validation and exit code |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| Any | `raw-json` | – | – | – | *either* | `raw-json/`: one file per input class. Used classes are not followed. | None. Exit 0. |
| Any | `json` | – | – | – | – | `json/`: one file for the input class and one for each used class, including CDL elementary blocks ([P11](#proposed-changes)). | All files in `json/` are validated against `schema-modelica.json`, and errors are printed ([P8](#proposed-changes)). Exit 0. |
| Any | `json` | – | – | – | ✓ | Same as above. | Same as above. In addition, all files in `json/` are validated against `schema-cdl.json`, and the [annotation checks](#general-rules) are performed. Exit 1 if any of these fails, which is always the case if the input class is not CDL-compliant. The files are written before the exit. |
| Any | `semantic` | – | – | – | *either* | `json/` and `objects/`: one file each for the input class and for each used class, including CDL elementary blocks ([P11](#proposed-changes)). | None: `--validateCdlSchema` is ignored without warning ([P1](#proposed-changes)). Exit 0. |
| Any | `cxf` | – | – | *either* | *either* | `json/` and `objects/`: one file each for the input class and for each used class, including CDL elementary blocks ([P11](#proposed-changes)). `cxf/`: one file for the input class and for each used class, except classes of the Modelica Standard Library, and except CDL elementary blocks unless `--elementary` is passed. | All files in `json/` are validated against `schema-cdl.json`, and errors are printed. Exit 1 if this validation fails and `--validateCdlSchema` is passed, exit 0 otherwise. An input class that is not CDL-compliant therefore produces CXF and exits 0 unless `--validateCdlSchema` is passed ([P3](#proposed-changes)). If the translation to CXF fails, for instance with `Cannot find instance ...` when a connect statement refers to an instance that cannot be resolved, the run exits 1 and the error message suggests using `--exportCxfFromModelica`. |
| With a controls instance | `cxf` | ✓ | – | *either* | *either* | `json/` and `objects/`: as above, except that some library classes are not followed (see [Used Class](#glossary)); CDL elementary blocks are followed. `cxf/`: only one controls instance is exported, even if several components are annotated with `__cdl(isControls=true)`, and which one depends on the order of the instances. The output is one file for the input class, which contains only the input class and this controls instance, and one file for the class of this controls instance; with `--elementary`, one file for each CDL elementary block used by that class ([P5](#proposed-changes)). | Only the class of the controls instance is validated against `schema-cdl.json`, and errors are printed. Exit 1 if this validation fails and `--validateCdlSchema` is passed, exit 0 otherwise. |
| CDL-compliant, without a controls instance | `cxf` | ✓ | – | *either* | *either* | Same CXF files as without `--exportCxfFromModelica`. | The classes for which CXF is written are validated against `schema-cdl.json`, and errors are printed. Exit 1 if this validation fails and `--validateCdlSchema` is passed, exit 0 otherwise. |
| Not CDL-compliant, without a controls instance | `cxf` | ✓ | – | *either* | *either* | `json/` and `objects/` only, no CXF. | Exit 1: `No block annotated with __cdl(isControls=true) found in <file>, and the class itself is not CDL-compliant (it does not validate against schema-cdl.json).` |
| CDL package (`-f` is `.../CDL`) | `cxf` | – | ✓ | ✓ | *either* | `cxf/CXF-Core.jsonld`, plus the `json/`, `objects/` and `cxf/` files of every class in the package, except the classes in `Validation` packages ([P6](#proposed-changes)). | Same as for `-o cxf` above. |
| Any | `doc` / `doc+` | – | – | – | *either* | `json/`: as for `-o json`, including CDL elementary blocks ([P11](#proposed-changes)). `<dir>/Sequence of Operation.html`, with the images in `<dir>/img/`: the documentation of the sequence of operation of the input class. With `doc+`, the documentation also includes tables listing the variables of the documented blocks. If `-f` is a package directory, only the first input class is documented ([P10](#proposed-changes)). | None: `--validateCdlSchema` is ignored without warning ([P1](#proposed-changes)). Exit 0, or exit 1 if the documentation cannot be generated, which currently happens for most CDL sequences ([P10](#proposed-changes)). |
| A `json` output file (`-f` is a `.json` file) | `modelica` | *either* | *either* | *either* | *either* | `<dir>/modelica/<path>.mo`: the Modelica code of the class, where `<path>` is the `-f` path as given, without the `.json` extension. For example, `-f /a/b/C.json` gives `<dir>/modelica/a/b/C.mo`. All the flags in this row have no effect ([P9](#proposed-changes)). | None. Exit 0. A `raw-json` output file is also accepted, but yields an almost empty file, such as `within FromModelica;` only ([P9](#proposed-changes)). |

## Proposed Changes

Items marked were reproduced by running `app.js`. The other items are based on reading the code. Items marked 😈 fix at least one bug, that is, a wrong output, a wrong exit code or a crash; the other items are changes of design.

- **P1. Unify the handling of `--validateCdlSchema` for outputs that are not validated.** This is also addressed by [P15](#proposed-changes). The flag is ignored with a warning for `raw-json`, and without any warning for `semantic`, `doc`, `doc+` and `modelica`. The parameter `validateCdlSchema` of `objectExtractor.extractAllObjects` is not used. Proposal: reject the flag with an argument error for any output other than `json` and `cxf`, or validate the intermediate `json/` files for `semantic` as is done for `cxf`.
- 😈 **P2. Validate only the files of the current run.** `validateJsons` (`app.js`) validates every file in `<dir>/json/`, including files left by earlier runs and files unrelated to the input. For example, a CDL-compliant block exits 1 with `--validateCdlSchema` if `<dir>/json/` still contains the JSON of a non-CDL model from an earlier run. With the default `-d`, running from the repository root validates the repository's own `json/` folder. Proposal: validate the files returned by `getJsons` for this run.
- 😈 **P3. Reject classes that are not CDL-compliant with `-o cxf`.** This is also addressed by [P15](#proposed-changes). Without `--exportCxfFromModelica`, the input class is not checked before CXF is written: a plain Modelica model (`model M Real x; equation x = 1; end M;`) gives `cxf/M.jsonld` and exits 0, and the `schema-cdl.json` errors are only printed. The run fails only when the CXF translation itself throws an error. Proposal: validate the input class against `schema-cdl.json` before generating CXF, and fail with the message that suggests `--exportCxfFromModelica`, as is done with `--exportCxfFromModelica`. As a consequence, `--validateCdlSchema` for `-o cxf` would only control whether errors in used classes make the run fail; consider renaming it, or always failing on errors.
- 😈 **P4. Make the annotation checks consistent.** The checks for `defaultComponentName` and `Documentation` (see [General Rules](#general-rules)) are performed only for `-o json`, and not for `-o cxf` even with `--validateCdlSchema`. They print warnings with `console.warn` and are counted in `warnCounter`, although they make the run fail. Proposal: report them as errors, perform them wherever `schema-cdl.json` is validated, or move them into `schema-cdl.json`. Also fix the following two bugs:
  - A class without any annotation is not checked (`if (longClassAnnotation !== null)` in `checkCDLSequence`): such a class lacks both `defaultComponentName` and `Documentation`, but passes.
  - The checks are skipped on reruns: `checkCDLSequence` is called only when a file is actually parsed. If a `json/` output with a matching checksum already exists in the output directory, the file is loaded from this cache and never checked, so the same command can exit 1 the first time and 0 the second.
- 😈 **P5. Clarify the export of controls instances.** Only one controls instance is exported, even if several components are annotated with `__cdl(isControls=true)`, and which one is exported depends on the order of the instances. The CDL composite blocks used by the class of the controls instance get no CXF file, whereas they get one when this class is exported directly as a CDL-compliant class. Proposal: export all controls instances, and write CXF for their composite blocks as `exportCdlClassCxf` does in the other case.
- 😈 **P6. Make `--cxfCore` more robust.** This is also addressed by [P15](#proposed-changes).
  - The check of `-f` is a suffix check on the string: `.../CDL/` (with a trailing slash) is rejected, while any path ending with `cdl` is accepted.
  - With `--exportCxfFromModelica`, the CXF files of the blocks are not written, but `getCxfCore` reads them from `cxf/` to assemble `CXF-Core.jsonld`. This flag combination should be rejected.
  - `getCxfCore` merges every file found under `cxf/`, including files left by earlier runs.
  - `getCxfClassesProperties` reads `lib/s231ClassesProperties.ttl` relative to the current directory, so `--cxfCore` fails unless the run is started from the repository root.
  - Since `--cxfCore` requires `--elementary`, it could imply it instead of raising an error.
- **P7. Rename `-f`/`--file` to `-i`/`--input`.** This is also addressed by [P15](#proposed-changes). The option accepts a `.mo` file, a package directory, or a `.json` file for `-o modelica`, so `--file` is misleading. `-i`/`--input` covers all these cases, is the counterpart of `-o`/`--output`, and is not used yet. (`-p`/`--path` is not available, because `-p` is used by `--prettyPrint`.) `-f`/`--file` could be kept for some time as a deprecated alias that prints a warning.
- 😈 **P8. Check `schema-modelica.json` against valid Modelica.** A component without a description string fails validation against `schema-modelica.json` (`must have required property 'description'`), although such code is valid Modelica. The schema seems to enforce CDL rules.
- 😈 **P9. Fix `-o modelica`.**
  - The argument checks that follow the `.json` checks are skipped, so `--cxfCore`, `--exportCxfFromModelica`, `--validateCdlSchema` and `--elementary` are accepted and ignored. They should be rejected, as `--cxfCore` and `--exportCxfFromModelica` are for the other outputs.
  - The CLI always reads the input as a `json` output (`convertToModelica(..., rawJson = false)`). A `raw-json` file therefore gives a truncated `.mo` file and exit 0, although `json2mo` supports `raw-json`. Proposal: detect the format (`final_class_definitions` for `raw-json`, `stored_class_definitions` for `json`), or reject `raw-json` files.
  - The output path reproduces the full `-f` path under `<dir>/modelica/`, for instance `<dir>/modelica/home/user/.../Parameter1.mo` for an absolute path. The other outputs use the path relative to the library. Proposal: build the path from `within` and the class name.
  - Without `-d`, the output is written to `./current/modelica/` instead of `./modelica/`: unlike `getJsons`, `convertToModelica` does not replace the default value `current` with the current directory.
  - A directory is rejected with the message `Modelica output requires the input file (-f) to be a json file.` Converting all the JSON files of a directory would be consistent with the other outputs.
- 😈 **P10. Fix `-o doc` and `-o doc+`.** ✅ Addressed with #332 and #333.
  - The documentation cannot be generated for most CDL sequences. The run exits 1 with `Cannot read properties of undefined (reading 'name')` (or `'split'`, or `'replace'`) for the test blocks `MyController`, `Enable` and `PointList`, and for the G36 sequences `AHUs.MultiZone.VAV.Controller` and `AHUs.SingleZone.VAV.SetPoints.CoolingCoil` (local checkout of the Modelica Buildings Library), with or without `--elementary`, on this branch and on `master`. The command-line path is not tested: `test_cdlDoc.js` calls `buildDoc` on a stored JSON file, and `test/cdlDoc/Library/ControlBlock.mo` is empty. Proposal: fix the crashes and add a test that runs `app.js -o doc` on a G36 sequence.
  - Without `-d`, the HTML file is written to `./current/` instead of the current directory, while the JSON files are written to `./json/`: `app.js` passes the default value `current` to `buildDoc` unchanged.
  - The HTML file is written directly to `<dir>`, rather than to `<dir>/doc/` as other outputs are written to a folder named after the format. Its name is always `Sequence of Operation.html`, whatever the class, so each run overwrites the previous file, while existing images in `<dir>/img/` are not overwritten. Proposal: write `<dir>/doc/<class path>.html`.
  - If `-f` is a package directory, only the first input class is documented (`buildDoc(jsons[0], jsons, ...)`), and the other classes are silently ignored.
- 😈 **P11. Restore the handling of CDL elementary blocks of commit `b715c09`.** This is also addressed by [P15](#proposed-changes).
  - At commit `b715c09`, which ctrl-flow uses (`MODELICA_JSON_COMMIT` in `ctrl-flow-dev/server/Dockerfile`, which runs `app.js -f modelica-buildings/Buildings/Templates -o json`), `getSimpleJson` parses all used classes, including CDL elementary blocks, and `--elementary` is only used by `generateCxf` to decide whether CXF is written for elementary blocks. This is the expected behavior: requiring `--elementary` to get the complete `json` output in the standard use case is not advisable, because consumers of `json` need the elementary blocks (for instance their parameters, connectors and types), and `--elementary` with a package directory also skips the `Validation` packages, which changes the output beyond the elementary blocks.
  - This branch deviates from it (commit `d94359ea`): `getSimpleJson` skips elementary blocks unless `--elementary` is passed, for `json`, `semantic`, `cxf`, `doc` and `doc+`. For the test block `Enable`, `-o json` writes 1 file without the flag and 18 with it (17 of them for elementary blocks). `master` deviates too, since PR #307: with `-o json` and the default `-m cdl`, elementary blocks are skipped, and can only be obtained with `-m modelica`. Upgrading ctrl-flow to either version would silently drop the elementary blocks from its output.
  - The README and the help text of `app.js` state the expected behavior: `--elementary` requires `-o cxf`. The corresponding argument check is however not implemented: on `b715c09` and `master`, its condition `!args.output === 'cxf'` is never true, and this branch removed it.
  - A consequence of the deviation: if `-f` is a CDL elementary block (for example `CDL/Reals/Add.mo`) and `--elementary` is not passed, nothing is parsed. `-o semantic` exits 0 without writing any file, while `-o json` and `-o cxf` exit 1 with `Cannot read properties of undefined (reading 'filter')`, because `validateJsons` reads a `json/` folder that does not exist, and `-o cxf` also wrongly suggests that the model may not be CDL-compliant.
  - Proposal: remove the skip of elementary blocks from `getSimpleJson`, keep the test on `--elementary` in `generateCxf` and `exportCdlClassCxf` only, and implement the argument check with `args.output !== 'cxf'`. Add a test that checks that `-o json` includes the elementary blocks without `--elementary`.
- 😈 **P12. Use a single, robust definition of CDL elementary blocks.**
  - `checkIfCdlElementaryBlockOrPackage` decides from the file path and a hard-coded list of package names. A new CDL package would silently be treated as composite, and the CDL library is not recognized if its root directory name does not contain `Buildings` (for example, `/x/MyLib/Controls/OBC/CDL/Reals/Add.mo` returns `false`). In that case, its blocks would be parsed, validated against `schema-cdl.json` and exported to CXF even without `--elementary`.
  - The definition includes connectors, types, `Constants` and `package.mo` files, so `--elementary` also controls whether these get a CXF file. The name of the flag does not suggest this.
  - Other parts of the code use a different test: the class name starts with `Buildings.Controls.OBC.CDL` (`lib/cxfExtractor.js`, `lib/expressionEvaluation.js`). This test also matches the `Validation` models and `CDL/package.mo`.
  - The function has a second mode for package names (`singleFile = false`), which `lib/cxfExtractor.js:378` uses with the full name of a class. For `Buildings.Controls.OBC.CDL.Reals.Add`, this returns `false`, so the branch that types instances of elementary blocks with the `S231` namespace never runs. The instances are typed by the fallback branch instead: `test/reference/cxf/test/FromModelica/MyController.jsonld` has `"@type": "ex:Buildings.Controls.OBC.CDL.Reals.Add"`, whereas `CXF-Core.jsonld` defines this class as `S231:Buildings.Controls.OBC.CDL.Reals.Add`. If this is a bug, the CXF of composite blocks does not refer to the CXF-Core definitions of the elementary blocks they contain. In addition, the condition of the two-token case in this mode (`lib/util.js:692`) can never be true.
  - Proposal: define an elementary block from the full class name (`within` and the class name): the name starts with `Buildings.Controls.OBC.CDL.` and does not contain `.Validation.`. Use this test everywhere, and decide whether connectors and types are covered.
- **P13. Move this file to a new `docs` folder**, and link it from the README.
- **P14. Expand all expressions in the `json` output.** As described in [raw-json vs. json](#raw-json-vs-json), arithmetic expressions without parentheses are written as Modelica strings, and only some expressions are expanded into `simple_expression` objects. Until all expressions are fully expanded, any consumer that must evaluate expressions has to parse these strings again, with workarounds that have limitations. See also the open issue [#247](https://github.com/lbl-srg/modelica-json/issues/247) (*Nested simple_expression objects are not parsed*). To be discussed with @JayHuLBL.
- **P15. Separate the input, the parsed classes, the output, the validation and the strictness in the CLI.** The CLI answers five independent questions, but its options mix them, which explains most of the argument checks and of the proposals above:

  | Question | Current options |
  | :--- | :--- |
  | What is the input: `.mo` or `.json` file, directory, CDL class, or Modelica model with a controls instance? | Partly the file extension, partly `--exportCxfFromModelica`, partly the path string for `--cxfCore` |
  | Which classes are parsed: the input only, or also the used classes, CDL elementary blocks, `Validation` packages, library classes? | `-o raw-json` for the input only, `--elementary` for elementary blocks, `--elementary` or `--cxfCore` for `Validation` packages, `--exportCxfFromModelica` for library classes |
  | What is written? | `-o`, but every output also writes its intermediate files; `--cxfCore` is a separate product hidden behind a flag; `doc` and `modelica` use their own folder layout |
  | Against which schema are the files validated? | Implied by `-o`; `--validateCdlSchema` changes the schema for `json` only |
  | Do validation errors make the run fail? | `--validateCdlSchema`, which for `cxf` only means that errors are fatal, and is ignored for the other outputs |

  Proposal: one option per question, each with a single meaning.

  ```
  modelica-json -i PATH -o FORMAT[,FORMAT...] [-d DIR] [--validate none|modelica|cdl] [--strict] [--elementary] [-p]
  ```

  - **Input (`-i`, see [P7](#proposed-changes)): the type is detected, not declared.** A `.json` input requires `-o modelica`. A directory is accepted for every output. For `cxf`, the part to export is found as `getCxfFromModelica` already does: the input class if it is CDL-compliant, otherwise the instances annotated with `__cdl(isControls=true)`, otherwise an error. `--exportCxfFromModelica` is therefore no longer needed.
  - **Parsed classes: determined by the output, never by a flag.** `raw-json` and `modelica` read the input only. All other outputs parse the input class and all its used classes, including CDL elementary blocks ([P11](#proposed-changes)). Not following library classes, as `--exportCxfFromModelica` does, becomes an internal optimization of the CXF export. Only `cxf-core` skips the `Validation` packages; a generic `--exclude GLOB` option could cover other needs.
  - **Output: `-o` lists the requested products, and only these are written.** Each product is written to `<dir>/<format>/<class path>.<extension>`, including `doc` and `modelica` ([P9](#proposed-changes), [P10](#proposed-changes)). `--cxfCore` becomes the output `cxf-core`: `-o cxf-core -i .../CDL` implies the elementary blocks, which removes three argument checks ([P6](#proposed-changes)). `--elementary` remains, as an option of `cxf` only: also write the CXF of the elementary blocks used. Intermediate files are written to a cache folder, or only if requested (`-o json,cxf`).
  - **Schema: `--validate`, with a default that depends on the output.** For `json`, the default is `modelica`, and `cdl` can be requested. For `cxf`, the exported classes are always validated against `schema-cdl.json`, as part of the export, because the CXF of a class that is not CDL-compliant is meaningless ([P3](#proposed-changes)). For the other outputs, `--validate` is rejected unless there is something to validate ([P1](#proposed-changes)).
  - **Strictness: `--strict` makes any validation error fatal.** Once `schema-modelica.json` no longer rejects valid Modelica ([P8](#proposed-changes)), validation errors could become fatal by default, and `--strict` could be removed.

  The current use cases map as follows:

  | Current command | Proposed command |
  | :--- | :--- |
  | `-f X.mo -o raw-json` | `-i X.mo -o raw-json` |
  | `-f X.mo -o json` (ctrl-flow) | `-i X.mo -o json`, with the same output, including the elementary blocks |
  | `-f X.mo -o json --validateCdlSchema` | `-i X.mo -o json --validate cdl --strict` |
  | `-f X.mo -o cxf` (CDL-compliant class) | `-i X.mo -o cxf` |
  | `-f X.mo -o cxf --exportCxfFromModelica` | `-i X.mo -o cxf` (detected) |
  | `-f X.mo -o cxf --elementary` | `-i X.mo -o cxf --elementary` |
  | `-f .../CDL -o cxf --cxfCore --elementary` | `-i .../CDL -o cxf-core` |
  | `-f X.mo -o semantic` / `doc` / `doc+` | unchanged, with `-i` |
  | `-f X.json -o modelica` | `-i X.json -o modelica`, also for a directory |

  The argument checks reduce to two: the output must match the type of the input (only `modelica` for a `.json` input), and `--validate` and `--elementary` must apply to the requested output. The behavior table reduces to one row per output, plus the three cases of the CXF export.

  Points to decide:
  - If a CDL-compliant class also contains an instance annotated with `__cdl(isControls=true)`, the detection above exports the whole class.
  - For backward compatibility, `-f`, `--exportCxfFromModelica`, `--cxfCore` and `--validateCdlSchema` can be kept for some time as deprecated aliases that are mapped to the new options and print a warning. The command used by ctrl-flow, `-f ... -o json -d ...`, then keeps working.
  - The change is limited to the CLI layer: `app.js`, the entry points of `getJsons` and `getSimpleJson`, and `validateJsons`. The parsing and CXF code is not affected.
