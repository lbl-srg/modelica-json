package gov.lbl.parser.domain;

public class Component_declaration {
    private Declaration declaration;
    private Condition_attribute condition_attribute;
    private Comment comment;

    public Component_declaration(Declaration declaration, Condition_attribute condition_attribute, Comment comment) {
        this.declaration = declaration;
        this.condition_attribute = condition_attribute;
        this.comment = comment;
    }
}
