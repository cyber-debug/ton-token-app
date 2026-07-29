function findRootIdentifier(node) {
    if (node?.type === 'JSXIdentifier') {
        return node.name;
    }

    if (node?.type === 'JSXMemberExpression') {
        return findRootIdentifier(node.object);
    }

    if (node?.type === 'JSXNamespacedName') {
        return findRootIdentifier(node.namespace);
    }

    return '';
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Mark JSX component identifiers as used variables.',
        },
        schema: [],
    },
    create(context) {
        return {
            JSXOpeningElement(node) {
                const name = findRootIdentifier(node.name);

                if (/^[A-Z]/.test(name)) {
                    context.sourceCode.markVariableAsUsed(name, node);
                }
            },
        };
    },
};
