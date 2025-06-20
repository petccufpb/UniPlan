import { Link, StyleSheet, Text, View } from '@react-pdf/renderer'
import { marked } from 'marked'
import type { Token, TokenizerExtension } from 'marked'
import React from 'react'

const styles = StyleSheet.create({
	h1: { fontFamily: 'Helvetica', fontSize: 24, marginBottom: 10, marginTop: 15 },
	h2: { fontFamily: 'Helvetica', fontSize: 18, marginBottom: 8, marginTop: 12 },
	h3: { fontFamily: 'Helvetica', fontSize: 14, marginBottom: 6, marginTop: 10 },
	h4: { fontFamily: 'Helvetica', fontSize: 12, marginBottom: 4, marginTop: 8 },
	p: { fontFamily: 'Helvetica', fontSize: 12, marginBottom: 10 },
	list: { paddingLeft: 20, marginBottom: 10 },
	listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
	listItemSymbol: { marginRight: 5, fontSize: 11, fontFamily: 'Helvetica' },
	listItemContent: { flex: 1, fontSize: 11, fontFamily: 'Helvetica' },
	hr: { borderBottomWidth: 1, borderBottomColor: '#cccccc', marginVertical: 15 },
	strong: { fontFamily: 'Helvetica-Bold' },
	em: { fontStyle: 'italic' },
	del: { textDecoration: 'line-through' },
	link: { color: 'blue', textDecoration: 'underline' },
	preformatted: {
		fontFamily: 'Helvetica',
		fontSize: 12,
		marginTop: 10,
		marginBottom: 10,
	},
})

interface AlignmentContainerToken {
	type: 'alignmentContainer'
	raw: string
	align: 'center' | 'right' | 'left' | 'justify'
	tokens: Token[]
}

const alignmentExtension: TokenizerExtension = {
	name: 'alignmentContainer',
	level: 'block',
	start(src: string): number | undefined {
		return src.match(/:::\s*align-(center|right|left|justify)/)?.index
	},
	tokenizer(this: any, src: string): AlignmentContainerToken | undefined {
		const rule = /^:::\s*align-(center|right|left|justify)\n([\s\S]+?)\n:::/;
		const match = rule.exec(src);

		if (match) {
			const align = match[1].trim() as AlignmentContainerToken['align'];
			const innerContent = match[2].trim();
			const tokens = this.lexer.blockTokens(innerContent, []);
			return {
				type: 'alignmentContainer',
				raw: match[0],
				align: align,
				tokens: tokens,
			};
		}
		return undefined;
	},
}

marked.use({ extensions: [alignmentExtension] });

const renderInlineTokens = (tokens: Token[] | undefined): React.ReactNode => {
	if (!tokens || tokens.length === 0) return null;

	return tokens.map((token, index) => {
		const key = `${token.type}-${index}`;

		switch (token.type) {
			case 'strong':
				return (
					<Text key={key} style={styles.strong}>
						{renderInlineTokens(token.tokens)}
					</Text>
				)
			case 'em':
				return (
					<Text key={key} style={styles.em}>
						{renderInlineTokens(token.tokens)}
					</Text>
				)
			case 'del':
				return (
					<Text key={key} style={styles.del}>
						{renderInlineTokens(token.tokens)}
					</Text>
				)
			case 'link':
				return (
					<Link key={key} src={token.href} style={styles.link}>
						{renderInlineTokens(token.tokens)}
					</Link>
				)
			case 'text':
				return <Text key={key}>{token.raw}</Text>
			default:
				return null
		}
	})
}

interface ListItemToken {
	type: string
	raw: string
	tasks?: boolean
	checked?: boolean
	tokens: Token[]
}

type ListToken = Token & {
	ordered?: boolean
	items: ListItemToken[]
}

const renderToken = (token: Token, index: number): React.ReactNode => {
	const key = `${token.type}-${index}`

	switch (token.type) {
		case 'rawBlock':
			return <Text key={key}>{token.text}</Text>

		case 'alignmentContainer':
			return (
				<View key={key} style={{ textAlign: token.align }}>
					{token.tokens?.map((childToken: Token, childIndex: number) =>
						renderToken(childToken, index * 1000 + childIndex)
					)}
				</View>
			)

		case 'heading': {
			const headingStyle = styles[`h${token.depth}` as keyof typeof styles] || styles.h4
			return (
				<Text key={key} style={headingStyle}>
					{renderInlineTokens(token.tokens)}
				</Text>
			)
		}

		case 'paragraph':
			return (
				<Text key={key} style={styles.p}>
					{renderInlineTokens(token.tokens)}
				</Text>
			)

		case 'list':
			return (
				<View key={key} style={styles.list}>
					{(token.items as ListItemToken[]).map((item: ListItemToken, itemIndex: number) => {
						const itemKey = `${key}-item-${itemIndex}`
						return (
							<View key={itemKey} style={styles.listItem}>
								<Text style={styles.listItemSymbol}>
									{(token as ListToken).ordered ? `${itemIndex + 1}.` : '•'}
								</Text>
								<Text style={styles.listItemContent}>
									{renderInlineTokens(item.tokens)}
								</Text>
							</View>
						)
					})}
				</View>
			)

		case 'hr':
			return <View key={key} style={styles.hr} />

		case 'space':
			return (
				<React.Fragment key={key}>
					{token.raw.split('\n').map((each: string, i: number) => (
						<View key={`${key}-line-${i}`} style={{ height: 10 }} />
					))}
				</React.Fragment>
			)

		default:
			console.warn(`Token de bloco não suportado: ${token.type}`)
			return null
	}
}

interface MarkdownRendererProps {
	children: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
	const markdownText = children || ''
	const tokens = marked.lexer(markdownText)

	return <>{tokens.map((token, index) => renderToken(token, index))}</>
}

export default MarkdownRenderer
