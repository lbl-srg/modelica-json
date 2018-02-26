package gov.lbl.parser.domain;

import java.util.List;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Connect_clause {
    private List<String> component1;
    private List<String> component2;

    public Connect_clause(String component_reference1, String component_reference2) {
    	Pattern pattern = Pattern.compile("\\.");
    	Matcher matcher1 = pattern.matcher(component_reference1);
    	Matcher matcher2 = pattern.matcher(component_reference1);

    	if (!matcher1.matches()) {
    		this.component1 = Arrays.asList(component_reference1.split("\\."));
    	} else {
    		this.component1 = Arrays.asList(component_reference1);
    	}
    	if (!matcher2.matches()) {
    		this.component2 = Arrays.asList(component_reference2.split("\\."));
    	} else {
    		this.component2 = Arrays.asList(component_reference2);
    	}
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Connect_clause aConnect_clause = (Connect_clause) o;
      return component1 != null ? component1.equals(aConnect_clause.component1) : aConnect_clause.component1 == null;
    }

    @Override
    public int hashCode() {
      int result = component1 != null ? component1.hashCode() : 0;
      result = 31 * result + (component2 != null ? component2.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Connect_clause{")
    			     .append("\ncomponent1=").append(component1).append('\'')
    			     .append("\ncomponent2=").append(component2).append('\'').append('}')
    			     .toString();
    }
}
