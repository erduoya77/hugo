package markdown

import (
	"fmt"
	"regexp"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/text"
	"github.com/yuin/goldmark/util"
)

// 网易云音乐链接的正则表达式
var neteaseRegex = regexp.MustCompile(`\[([^\]]+)\]\((https?:\/\/)?music\.163\.com\/(?:#\/)?song(?:\?id=|\/)(\d+)(?:[^)]*)\)`)

// 自定义的音乐节点
type MusicNode struct {
	ast.BaseInline
	Title  string
	SongID string
}

// 实现必要的节点接口
func (n *MusicNode) Dump(source []byte, level int) {
	fmt.Printf("Music(%q, %q)\n", n.Title, n.SongID)
}

// 自定义的解析器扩展
type musicExtension struct{}

// 注册解析器扩展
func (e *musicExtension) Extend(p parser.Parser) {
	p.Inline().Register(parseMusic)
}

// 解析音乐链接
func parseMusic(p parser.InlineParser) parser.InlineProcessor {
	return parser.InlineProcessorFunc(func(parent ast.Node, reader text.Reader, pc parser.Context) (ast.Node, parser.InlineContext) {
		line, _ := reader.PeekLine()
		match := neteaseRegex.FindSubmatch(line)
		if match == nil {
			return nil, nil
		}

		reader.Advance(len(match[0]))
		return &MusicNode{
			Title:  string(match[1]),
			SongID: string(match[3]),
		}, nil
	})
}

// 自定义的渲染器
type musicRenderer struct{}

// 实现渲染器接口
func (r *musicRenderer) RegisterFuncs(reg renderer.NodeRendererFuncRegisterer) {
	reg.Register(&MusicNode{}, r.renderMusic)
}

// 渲染音乐节点
func (r *musicRenderer) renderMusic(w util.BufWriter, source []byte, node ast.Node, entering bool) (ast.WalkStatus, error) {
	if !entering {
		return ast.WalkContinue, nil
	}

	n := node.(*MusicNode)
	fmt.Fprintf(w, `<div class="memo-music-wrapper"><div class="memo-music"><meting-js auto="https://music.163.com/song?id=%s"></meting-js></div></div>`, n.SongID)
	return ast.WalkContinue, nil
}

// 创建新的Markdown渲染器
func NewRenderer() goldmark.Markdown {
	md := goldmark.New(
		goldmark.WithExtensions(&musicExtension{}),
		goldmark.WithRendererOptions(
			renderer.WithNodeRenderers(
				util.Prioritized(&musicRenderer{}, 500),
			),
		),
	)
	return md
}
