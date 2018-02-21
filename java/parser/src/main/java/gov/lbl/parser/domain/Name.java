package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;

public class Name {
    public String name;

    public Name(Collection<String> dots, Collection<String> ident) {
    	String nameString = "";
    	if (dots == null) {
    		nameString = null;
    	} else {
    		List<String> dotList = new ArrayList<String>(dots);
        	List<String> identList = new ArrayList<String>(ident);
    		if (dots.size()==ident.size()) {
        		for (int i=0; i<ident.size(); i++) {
        			nameString = nameString + dotList.get(i) + identList.get(i);
        		}
        	} else {
        		nameString = identList.get(0);
        		for (int i=1; i<ident.size(); i++) {
        			nameString = nameString + dotList.get(i-1) + identList.get(i);
        		}
        	}
    	}

      this.name = nameString;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Name aName = (Name) o;
      //if (ident != null ? !ident.equals(aName.ident) : aName.ident != null) return false;
      return name != null ? name.equals(aName.name) : aName.name == null;
    }

    @Override
    public int hashCode() {
      int result = name != null ? name.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Name{")
    			     .append("\nname=").append(name)
    			     .append('\'').append('}')
    			     .toString();
    }
}
