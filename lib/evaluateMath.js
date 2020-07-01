/**
 * Further simplify the json representation through evaluating the parameter assignment
 * 
 * @param data simplified json representation
 * @param evaProPar flag to check if evaluate propagated parameters in CDL model
 * @param evaExp flag to check if evaluate expression in CDL model
 * @return json output with evaluated parameters and expressions
 */
function evaluateParExp(data, evaProPar, evaExp) {
  var pubPar = (data.public && data.public.parameter) ? data.public.parameter : null
  var proPar = (data.protected && data.protected.parameter) ? data.protected.parameter : null
  var pubMod = (data.public && data.public.models) ? data.public.models : null
  var proMod = (data.protected && data.protected.models) ? data.protected.models : null
  // Evaluate parameter sections
  



// Evaluate class instantiations

}