let requiredFunctions = [];

module.exports = {
  meta: {
    type: "suggestion",
  },
  create(context) {
    return {
      Program() {
        requiredFunctions = []; // Clearing list between runs
        findVariablesInScope(context.getScope(), context);
      },
    };
  },
};

/**
 * Finds and validates all variables in a given scope.
 * @param {Scope} scope The scope object.
 * @returns {void}
 * @private
 */
function findVariablesInScope(scope, context) {
  scope.references.forEach(reference => {
    const variable = reference.resolved;

    addRequiredFunctionsToArray(reference);

    if (followsTopDownCallStructure(reference, variable)) return;

    context.report({
      node: reference.identifier,
      message: "'{{name}}' Does not follow a top-down call structure",
      data: reference.identifier,
    });
  });

  scope.childScopes.forEach(childScope =>
    findVariablesInScope(childScope, context)
  );
}

function addRequiredFunctionsToArray(reference) {
  if (
    reference &&
    reference.identifier &&
    reference.identifier.name === "require" &&
    reference.identifier.parent &&
    reference.identifier.parent.parent &&
    reference.identifier.parent.parent.id &&
    reference.identifier.parent.parent.id.name
  ) {
    requiredFunctions.push(reference.identifier.parent.parent.id.name);
  }
}

function followsTopDownCallStructure(reference, variable) {
  return (
    reference.init ||
    !variable ||
    variable.identifiers.length === 0 ||
    (
      isNotAFunctionCall(reference) ||
      isCallinAbstractionTopDown(variable, reference) ||
      isCallinSameScopeDownTop(variable, reference) ||
      isARequiredFunction(reference) ||
      isNotADeclaration(variable) ||
      isRecursiveFunction(reference.identifier, reference.identifier.name) ||
      (!isOuterVariable(variable, reference) && !isFunction(variable)))
  );
}

const isNotAFunctionCall = reference => {
  return reference.identifier.parent.type !== "CallExpression" ||
    (reference.identifier.parent.type === "CallExpression" &&
      reference.identifier.name !== reference.identifier.parent.callee.name);
};

const isCallinAbstractionTopDown = (variable, reference) =>
  (isCallingDown(variable, reference) && !isSameScope(variable, reference));

const isCallinSameScopeDownTop = (variable, reference) =>
  (isSameScope(variable, reference) && !isCallingDown(variable, reference));

const isCallingDown = (variable, reference) =>
  variable.identifiers[0].range[1] > reference.identifier.range[1];

const isSameScope = (variable, reference) =>
  variable.scope.variableScope === reference.from.variableScope;

const isARequiredFunction = reference =>
  requiredFunctions.includes(reference.identifier.name);

const isNotADeclaration = variable => {
  return variable.identifiers[0].parent.type !== "VariableDeclarator" &&
    variable.identifiers[0].parent.type !== "FunctionDeclaration";
};

const isRecursiveFunction = (identifier, funcName) => {
  if (!identifier.parent) {
    return false;
  }

  if (identifier.parent.id && identifier.parent.id.name === funcName) {
    return true;
  }

  return isRecursiveFunction(identifier.parent, funcName);
};

const isOuterVariable = (variable, reference) => {
  return variable.defs[0].type === "Variable" &&
    variable.scope.variableScope !== reference.from.variableScope;
};

const isFunction = (variable) =>
  variable.defs[0].type === "FunctionName";
