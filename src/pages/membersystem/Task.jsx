import '../../styles/scss/Task.module.scss';
import NavbarWebsite from '../../components/NavbarWebsite';


export default function Task() {
  // 範例靜態資料
  const tasks = [
    {
      id: 1,
      name: "租借累積4小時",
      progress: 1,
      total: 4,
      deadline: "2025-09-28",
      point: 2
    },
    {
      id: 2,
      name: "完成首次註冊",
      progress: 1,
      total: 1,
      deadline: "2025-09-30",
      point: 1
    }
  ];

  return (
    <div className="container">
      <NavbarWebsite />
      {/* 直接放在 container 內，main 外 */}
      <div className="points-circle-wrapper">
        <div className="circle points-circle">
          <span className="points-text">點數</span>
        </div>
      </div>
      <div className="shop-circle-wrapper">
        <div className="circle shop-circle">
          <img src="/shop-car.png" alt="shop" className="shop-img" />
          <span className="shop-text">去逛逛</span>
        </div>
      </div>
      <main className="main">
        {/* 移除 points-shop-row */}
        <h2 className="title">任務</h2>
        <div className="taskList">
          {tasks.length === 0 ? (
            <div>載入中...</div>
          ) : (
            tasks.map(task => (
              <div className="taskCard" key={task.id}>
                <div className="taskInfo">
                  <span className="taskName">{task.name}</span>
                  <div className="progressBar">
                    <div
                      className="progress"
                      style={{ width: `${(task.progress / task.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progressText">
                    {task.progress}/{task.total}
                  </span>
                </div>
                <div className="rewardSection">
                  <span className="deadline">至{task.deadline}</span>
                  <span className="point">P {task.point}</span>
                  <button className="claimBtn">領取</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}