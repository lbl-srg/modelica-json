package gov.lbl.parser.domain;

public class Comment {
    private String string_comment;
    private Annotation annotation;
    public Comment(String string_comment, Annotation annotation) {
        this.string_comment = string_comment;
        this.annotation = annotation;
	}
}
