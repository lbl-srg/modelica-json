package gov.lbl.parser.domain;

public class Import_clause {
    private String prefix;
    private String ident;
    private String symbols;
    private String name;
    private String import_list;
    private Comment comment;

    public Import_clause(String import_dec,
                         String ident,
                         String dotStar,
                         String name,
                         String import_list,
                         Comment comment) {
    	this.prefix = import_dec;
    	this.ident = ident;
    	this.name = name;
    	this.import_list = import_list;
    	if (ident != null) {
    		this.symbols = "=";
    	} else if (dotStar != null) {
    		this.symbols = dotStar;
    	} else {
    		this.symbols = null;
    	}
        this.comment = comment;
    }
}
