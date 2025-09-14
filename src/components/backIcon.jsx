function BackIcon({style, className}) {
    return (

        <span
            className={`back-icon ${className}`}
            onClick={() => window.history.back()}
            title="回到上頁"
            style={style || null}
        >
            ◀︎
        </span>
    )
}

export default BackIcon;