
import React from 'react';
import "./Prefectures.css";

class Prefectures extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prefecturesList: [],
      prefecturesCodes: [],
      checkItems: [],
      resultList: [],
    }
    this.handleKenChange = this.handleKenChange.bind(this);
  }

  componentDidMount() {
    // RESASから47都道府県の一覧を取得
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      method: "GET",
      headers: { 'X-API-KEY': '7eUMJb88otIbAW0BX65fqKXcLgvmezOaZXn6aCG2' }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`リクエスト失敗 status code ${response.status} `);
        }
      })
      .then(data => {
        // 都道府県名取得
        let prefName_data = [];
        // 都道府県コード取得
        let prefCode_data = [];

        for (let i = 0; i < data.result.length; i++) {
          prefName_data.push(data.result[i].prefName);
          prefCode_data.push(data.result[i].prefCode);
        }

        this.setState({
          prefecturesList: prefName_data,
          prefecturesCodes: prefCode_data,
        })
      });
  }


  handleKenChange(e) {
    let prefCode = ''

    if (e.target.checked) {
      // チェックされた都道府県コードを取得
      prefCode = e.target.id.replace(/check-/, '');
      this.setState({
        checkItems: {
          [e.target.id]: e.target.checked
        }
      })
    } else {
      // チェックが外れた場合は都道府県の選択状態を初期化して画面表示をリセット
      const newCheckItems = { ...this.state.checkItems };
      delete newCheckItems[e.target.id];
      this.setState({
        checkItems: newCheckItems,
        resultList: [],
      })
      return;
    }

    // RESASから人口構成を取得
    fetch(`https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefCode}`,
      {
        method: "GET",
        headers: { 'X-API-KEY': '7eUMJb88otIbAW0BX65fqKXcLgvmezOaZXn6aCG2' }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`リクエスト失敗 status code ${response.status} `);
        }
      })
      .then(list => {

        // 人口構成全データを取得
        let dataList = list.result.data;

        // 表示用データ
        let resultList = [];

        for (let i = 0; i < dataList[0].data.length; i++) {
          // 1行データ
          let row = [];

          // 西暦
          row.push(dataList[0].data[i].year + "年");

          for (let j = 0; j < dataList.length; j++) {
            // 各項目の人口
            row.push(dataList[j].data[i].value.toLocaleString() + "人");

            if (j === 0) {
              // 総人口増加率
              row.push(i === 0 ? '-' : Math.round((dataList[j].data[i].value - dataList[j].data[i - 1].value) / dataList[j].data[i - 1].value * 1000) / 10 + "%");
            } else if ("rate" in dataList[j].data[i]) {
              // 各項目の総人口に占める割合
              row.push(dataList[j].data[i].rate + "%");
            }
          }
          resultList.push(row);
        }

        // 降順に並べ替え
        resultList.reverse();

        this.setState({
          resultList: resultList
        })
      });
    // }
  }

  render() {

    return (
      <>
        <h1>都道府県一覧</h1>
        <ul className="prefectures">
          {/* 都道府県コードを使用して動的にチェックボックスを作成 */}
          {this.state.prefecturesList.map((list, i) =>
            <label>
              <input
                type="checkbox"
                id={"check-" + this.state.prefecturesCodes[i]}
                className="check"
                checked={this.state.checkItems["check-" + this.state.prefecturesCodes[i]] || false}
                onChange={this.handleKenChange}
              />{list}
            </label>)}
        </ul>

        <h1>人口推移</h1>
        {/* 人口推移の表を動的に作成 */}
        <div className='table'>
          <table>
            <thead>
              <tr>
                <th>西暦</th><th>総人口（人数）</th><th>総人口（増加率）</th><th>年少人口（人数）</th><th>年少人口（割合）</th><th>生産年齢人口（人数）</th><th>生産年齢人口（割合）</th><th>老年人口（人数）</th><th>老年人口（割合）</th>
              </tr>
            </thead>
            <tbody>

              {this.state.resultList.map((row) =>
                <tr>
                  {row.map((column) =>
                    <td>
                      {column}
                    </td>
                  )}
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </>
    )
  }
}

export default Prefectures;
