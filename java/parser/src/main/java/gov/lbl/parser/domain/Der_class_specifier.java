package gov.lbl.parser.domain;

import java.util.Collection;

public class Der_class_specifier {
    private String der_left;
    private Collection<String> der_in;
    private String name;
    private Comment comment;

    public Der_class_specifier(String ident1,
    						   Collection<String> comma,
                               Collection<String> ident2,
                               String name,
                               Comment comment) {
      this.der_left = ident1;
      this.name = name;
      this.der_in = ident2;
      this.comment = comment;
    }
}
