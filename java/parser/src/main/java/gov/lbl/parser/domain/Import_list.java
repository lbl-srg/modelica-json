package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;

public class Import_list {
    private String importList;

    public Import_list(Collection<String> ident) {
    	String listString="";
    	List<String> identList = new ArrayList<String>(ident);
    	if (ident.size() > 1) {
    		for (int i=1; i<ident.size(); i++) {
    			listString = listString + "," + identList.get(i);
        	}
    	}
    	this.importList = identList.get(0) + listString;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Import_list aImport_list = (Import_list) o;
      return importList != null ? importList.equals(aImport_list.importList) : aImport_list.importList == null;
    }

    @Override
    public int hashCode() {
      int result = importList != null ? importList.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Import_list{")
    			     .append("\nimportList=").append(importList)
    			     .append('\'').append('}')
    			     .toString();
    }
}
