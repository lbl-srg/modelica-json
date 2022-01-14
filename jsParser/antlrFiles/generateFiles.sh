cp ../../java/antlrVisitor/src/main/antlr4/gov/lbl/antlr4/visitor/modelica.g4 .
java -Xmx504M -cp "/usr/local/lib/antlr-4.5.3-complete.jar:$CLASSPATH" org.antlr.v4.Tool -Dlanguage=JavaScript -visitor modelica.g4
