class ServerToAppReceiver {
  constructor(private conn: WebSocket) {
    this.conn.addEventListener('open', this.onConnect)
    this.conn.addEventListener('message', this.onReceive)
  }

  private onConnect = () => {

  }

  private onReceive = (msg) => {
    const data = JSON.parse(msg)
  }
}
