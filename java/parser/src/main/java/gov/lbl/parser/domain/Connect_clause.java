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
}
