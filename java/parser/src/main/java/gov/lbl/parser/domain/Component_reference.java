package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;

public class Component_reference {
    private String component;
    private Collection<Array_subscripts> array;

    public Component_reference(Collection<String> ident,
    						   Collection<String> dots,
                               Collection<Array_subscripts> array_subscripts) {
    	String componentStr = "";
    	List<String> identList = new ArrayList<String>(ident);
      	if (dots == null) {
      		componentStr = identList.get(0);
      	} else {
      		List<String> dotList = new ArrayList<String>(dots);
      		if (dots.size() == ident.size()) {
      			for (int i=0; i<ident.size(); i++) {
      				componentStr = componentStr + dotList.get(i) + identList.get(i);
      			}
      		} else {
      			componentStr = identList.get(0);
      			for (int i=1; i<ident.size(); i++) {
      				componentStr = componentStr + dotList.get(i-1) + identList.get(i);
      			}
      		}
      	}
      this.component = componentStr;
      this.array = (array_subscripts.size()>0 ? array_subscripts : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Component_reference aComponent_reference = (Component_reference) o;
      if (component != null ? !component.equals(aComponent_reference.component) : aComponent_reference.component != null) return false;
      return array != null ? array.equals(aComponent_reference.array) : aComponent_reference.array == null;
    }

    @Override
    public int hashCode() {
      int result = component != null ? component.hashCode() : 0;
      result = 31 * result + (array != null ? array.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Component_reference{")
    			     .append("\ncomponent=").append(component).append('\'')
    			     .append("\narray=").append(array)
    			     .append('\'').append('}')
    			     .toString();
    }
}
