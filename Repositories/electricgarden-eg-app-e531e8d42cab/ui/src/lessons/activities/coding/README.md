# Coding Activities

## ExampleCode

Example code is for displaying syntax highlighted code.

It is currently fixed to python but we could do basically any language.

See https://www.npmjs.com/package/react-syntax-highlighter for full docs.

Basic usage:

```jsx
<ExampleCode>print "Ka pai"</ExampleCode>
```

### Multi Line

Realistically you are going to need multiple lines.

Unfortunately this is a bit awkward because of editors and react components.

But we have a way to get it inside `.mdx`:

Basically enclose your code with ` {``} ` like so:

```jsx
<ExampleCode>
    {`message = "Kia ora, Electric Garden!"
print message`}
</ExampleCode>
```

Note that if you tidy up the layout by adding newlines you end up with empty lines in the output.

### Line Numbering

You can show line numbers with `showLineNumbers`.

If you want you can start from something other than one with `startingLineNumber`.

Full example below:

<ExampleCode showLineNumbers startingLineNumber={15}>
    {`message = "Kia ora, Electric Garden!"
print message`}
</ExampleCode>
