package gov.lbl.parser;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.lbl.parser.domain.*;
import gov.lbl.parser.parser.VisitorOrientedParser;
import java.nio.charset.StandardCharsets;
import java.util.stream.Stream;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
	List<String> sumResults;

	private static final String modelicaSourceCode(String filePath) {
		return readLineByLineJava8(filePath);
	}

	private static String readLineByLineJava8(String filePath) {
		StringBuilder contentBuilder = new StringBuilder();
		Path path = Paths.get(filePath);
		try (Stream<String> lines = Files.lines(path, StandardCharsets.UTF_8)) {
			lines.forEach(s -> contentBuilder.append(s).append("\n"));
		}
		catch (IOException e) {
			e.printStackTrace();
		}
		return contentBuilder.toString();
	}

	private String fileNameToSearch;
	private List<String> result = new ArrayList<String>();
	public String getFileNameToSearch() {
		return fileNameToSearch;
	}
	public void setFileNameToSearch (String fileNameToSearch) {
		this.fileNameToSearch = fileNameToSearch;
	}
	public List<String> getResult() {
		return result;
	}

    public static void main(String[] args) throws Exception {
    	List<String> result = new ArrayList<String>();
    	try {
    		Main parser = new Main();
    		result = parser.moParser(args);
    		System.exit(0);
    	} catch (Exception e) {
    		//System.err.println(e);
    		e.printStackTrace();
    		System.exit(1);
    	}
    }

    private List<String> moParser(String[] args) throws Exception {
    	String cwDir = System.getProperty("user.dir");
    	String modelicaSource= "";
    	String jsonOut= "";
    	List<String> runLog = new ArrayList<String>();

    	String helMes = "\n Input arguments should be like: \n"
					+ "    \'-h\' : help info; \n"
					+ "or, \'--mo xx/xx/*.mo\' : parsed json text will be stored in memory; \n"
					+ "or, \'--mo xx/xx/*.mo --out-dir xx/\' : parsed json text will be stored in folder xx/; \n"
					+ "or, \'--mo xx/xx/\' : parse .mo files in the folder, parsed json text will be stored in memory; \n"
					+ "or, \'--mo xx/xx/ --out-dir xx/\' : parse .mo files in the folder, parsed json text will be stored in folder xx/; \n";
    	
    	try {
    		if ((args.length == 1 && !args[0].equals("-h"))
    			 || (args.length == 2 && !args[0].equals("--mo"))
    			 || (args.length == 4 && (!args[0].equals("--mo") || !args[2].equals("--out-dir")))) {
    			throw new IOException(helMes);
    		}
    	} catch (Exception e) {
    		runLog.add(e.getMessage());
    		this.sumResults = runLog;
    		throw new Exception(e);
    	}

    	if (args.length == 1) {
    		System.out.println(helMes);
    		runLog.add(helMes);
    		return runLog;
    	}

    	String moFilePath  = fullInputPath(args[1], cwDir);
   	
    	String moFileName = "";
    	String moFileDir = "";
    	if (moFilePath.contains(".mo")) {
    		int slaInd = moFilePath.lastIndexOf("/");
    		moFileName = moFilePath.substring(slaInd+1, moFilePath.length());
        	moFileDir = moFilePath.substring(0,slaInd);
    	} else {
    		moFileName = ".mo";
    		moFileDir = moFilePath;
    	}   	 	

    	String dirToBeSearched = moFileDir;
    	Main fileSearch = new Main();
    	fileSearch.searchDirectory(new File(dirToBeSearched), moFileName);

    	if (fileSearch.getResult().size() == 0) {
			String noFilMes = moFileName + " cannot be found. \nCheck file name and path: " + moFilePath;
    		runLog.add(noFilMes);
			throw new Exception(noFilMes);
    	} else {
    	    for (String matched : fileSearch.getResult()){
    	    	modelicaSource = modelicaSourceCode(matched);
    	    	Stored_definition antlrParseOut = null;
    	    	try {
    	    		antlrParseOut = new VisitorOrientedParser().parse(modelicaSource);
    	    	} catch (Exception e) {
    	    		runLog.add(e.getMessage());
    	    		throw new Exception(e);
    	    	}
    	    	Gson gson = new GsonBuilder().disableHtmlEscaping().setPrettyPrinting().create();
    	    	//Gson gson = new Gson();
    	    	jsonOut = gson.toJson(antlrParseOut);

    	    	if (args.length>2) {
    	    		String jsFile = "";
    	    		String jsFilePath = args[3];
    	    		/* --- the json output file path could be a/ or a ---*/
    	    		if (jsFilePath.charAt(jsFilePath.length()-1) == '/') {
    	    			jsFile = jsFilePath;
    	    		} else {
    	    			jsFile = jsFilePath.concat("/");
    	    		}
    	    		exportJsonFile(matched, moFileName, jsonOut, jsFile);
    	    	} else {
    	    		System.out.println(jsonOut);
    	    	}
    	    	runLog.add(jsonOut);
    	    }
    	}
    	this.sumResults = runLog;
    	return runLog;
    }

    private static String fullInputPath(String moFileInputPath, String cwDir) {
    	String fullPath = "";
    	String tempPath = "";
    	if (moFileInputPath.charAt(moFileInputPath.length()-1) == '/') {
    		tempPath = moFileInputPath.substring(0, moFileInputPath.length()-1);
    	} else {
    		tempPath = moFileInputPath;
    	}   	
		Path path = Paths.get(tempPath);
    	if (path.isAbsolute()) {
    		fullPath = tempPath;
		} else {
			// if the given path is like ../xxx/xxx.mo
			if (tempPath.contains("../")) {
				Pattern p = Pattern.compile("../");
				Matcher m = p.matcher(tempPath);
				int count1 = 0;
				while (m.find()){
				    count1 +=1;
				}
				int count2 = 0;
				List<Integer> dashInd = new ArrayList<Integer> ();
				for (int i=cwDir.length()-1; i > 0; i--) {
					if (cwDir.charAt(i) == '/') {
						count2 = count2 +1;
						dashInd.add(i);
						if (count2 == count1) {
							break;
						}
					}
				}
				fullPath = cwDir.substring(0, dashInd.get(dashInd.size()-1)+1).concat(tempPath);
			} else {
				fullPath = cwDir.concat("/".concat(tempPath));
			}
		}
    	return fullPath;
    }

    
    private void exportJsonFile(String searchedFile, String moFileName, String jsonOut, String jsFile) throws Exception {
    	String nameForJson = jsonDir(searchedFile, moFileName, jsFile).get(0);   	
		String dirRootStr = jsonDir(searchedFile, moFileName, jsFile).get(1);
		Path path = Paths.get(dirRootStr);
		File dirRoot = new File(dirRootStr);
		if (! dirRoot.exists()) {
    		try {
    		    Files.createDirectories(path);
    		} catch (IOException e) {
    		    System.err.println("Cannot create directories - " + e);
    		    throw new Exception(e);
    		}
    	}
		File newTextFile = new File(nameForJson);
		FileWriter fw = new FileWriter(newTextFile);
		fw.write(jsonOut);
		fw.close();
    }


    private static List<String> jsonDir(String str, String moFile, String jsFile) {
    	List<String> jsName_Dir = new ArrayList<String>();
    	String nameForJson = "";
    	String dirRootStr = "";   	
    	if (str.contains("/Buildings/")) {
    		int indexBuildings = str.indexOf("/Buildings/");
    		String buiSubDirForJson = str.substring(indexBuildings+1, str.lastIndexOf("."));
    		nameForJson = jsFile.concat(buiSubDirForJson.concat(".json"));
    	} else {   		
    		if (!moFile.equals(".mo")) {
    			int dotIndinFile = moFile.lastIndexOf(".");
    			nameForJson = jsFile.concat(moFile.substring(0, dotIndinFile).concat(".json"));
    		} else {
    			int lasSlaInd = str.lastIndexOf("/");
    			int lasDotInd = str.lastIndexOf(".");
    			nameForJson = jsFile.concat(str.substring(lasSlaInd+1, lasDotInd).concat(".json"));
    		}
    	}   		
		dirRootStr = nameForJson.substring(0, nameForJson.lastIndexOf("/"));
		jsName_Dir.add(nameForJson);
		jsName_Dir.add(dirRootStr);
		return jsName_Dir;
    }


    public void searchDirectory(File directory, String fileNameToSearch) {
    	setFileNameToSearch(fileNameToSearch);
    	if (directory.isDirectory()) {
    	    search(directory);
    	} else {
    	    System.out.println(directory.getAbsoluteFile() + " is not a directory!");
    	}
      }

    private void search(File file) {
    	if (file.isDirectory()) {
    	    if (file.canRead()) {
    	    	for (File temp : file.listFiles()) {
    	    		if (temp.isDirectory()) {
    	    			search(temp);
    	    		} else {
    	    			int dotInd = temp.getName().lastIndexOf(".");
    	    			int nameLen = temp.getName().length();
    	    			int indForExt = dotInd==(-1) ? 0 : dotInd;	    		
    	    			if ((getFileNameToSearch().equals(".mo") && getFileNameToSearch().equals(temp.getName().substring(indForExt,nameLen)))
    	    				 || (!getFileNameToSearch().equals(".mo") && getFileNameToSearch().equals(temp.getName()))) {
    	    				result.add(temp.getAbsoluteFile().toString());
    	    			}
    	    		}
    	    	}
    	 } else {
    		System.out.println(file.getAbsoluteFile() + "Permission Denied");
    	 }
          }

      }

}
