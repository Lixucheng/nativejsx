'use strict';

let {
  identifier,
  literal,
  variableDeclaration,
  assigns,
  member,
  expressionStatement,
  callExpression
} = require('./generators.js')

let compositions = {};

/**
 * Document API compositions
 */

const attributes = { 'className': 'class' };
const properties = ['required', 'disabled'];

compositions.createElement = (variable, tag) => {
  return variableDeclaration(
    variable,
    member('document', 'createElement'),
    [literal(tag)]
  );
};

compositions.createTextNode = (variable, expression) => {
  return variableDeclaration(
    variable,
    member('document', 'createTextNode'),
    [expression]
  );
};

compositions.setAttribute = (variable, attribute, assignmentExpression) => {
  let isProperty = properties.indexOf(attribute) !== -1;
  let mappedAttribute = attributes[attribute] || attribute;

  if (isProperty) {
    return assigns(
      member(variable, mappedAttribute),
      literal(true)
    );
  } else {
    return expressionStatement(
      callExpression(
        member(variable, 'setAttribute'),
        [literal(mappedAttribute), assignmentExpression]
      )
    );
  }
};

compositions.setAttributes = (variable, assignmentExpression) => {
  return expressionStatement(
    callExpression(
      member(variable, 'setAttributes'),
      [assignmentExpression]
    )
  );
};

compositions.addEventListener = (variable, event, expression) => {
  return expressionStatement(
    callExpression(
      member(variable, 'addEventListener'),
      [literal(event), expression]
    )
  );
};

compositions.appendChild = (parent, child) => {
  return expressionStatement(
    callExpression(
      member(parent, 'appendChild'),
      [identifier(child)]
    )
  );
};

compositions.appendChildren = (parent, expression) => {
  return expressionStatement(
    callExpression(
      member(parent, 'appendChildren'),
      [expression]
    )
  );
};

module.exports = compositions;
