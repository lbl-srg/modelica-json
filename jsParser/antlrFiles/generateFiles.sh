cp modelica.g4 .
java -Xmx504M -cp "/usr/local/lib/antlr-4.7.2-complete.jar:$CLASSPATH" org.antlr.v4.Tool -Dlanguage=JavaScript -visitor modelica.g4
