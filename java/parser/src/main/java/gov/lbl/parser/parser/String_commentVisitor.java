package gov.lbl.parser.parser;

import java.util.List;
import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import static java.util.stream.Collectors.toList;

public class String_commentVisitor extends modelicaBaseVisitor<String> {
    @Override
    public String visitString_comment(modelicaParser.String_commentContext ctx) {
        List<String> str_dec = ctx.STRING() == null ? null : ctx.STRING()
            .stream()
            .map(STRING -> STRING.getText())
            .collect(toList());
        String strCom = "";
        if (str_dec != null) {
            if (str_dec.size() == 1) {
                strCom = str_dec.get(0);
            } else if (str_dec.size() > 1) {       	
                StringBuilder temStr = new StringBuilder();
                temStr.append(str_dec.get(0));
                for (int i=1; i<str_dec.size(); i++) {
                    temStr.append("+").append(str_dec.get(i));
                }
                strCom = temStr.toString();
            }
        }
        return strCom;
    }
}