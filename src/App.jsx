import { useState, useEffect, useReducer, useRef } from 'react';
import {
  Switch,
  Collapse,
  Input,
  Select,
  Button,
  Badge,
  Tooltip,
  Space,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
const Panel = Collapse.Panel;
const Option = Select.Option;
import { buildUUID } from './utils/index';
import './App.css';
import Replacer from './components/replacer/index';

function App() {
  console.log(window);
  const forceUpdate = useReducer((x) => x + 1, 0)[1];
  const collapseWrapperRef = useRef();
  const addBtnRef = useRef();
  const updateAddBtnTopDebounceTimeout = useRef();
  const collapseWrapperHeight = useRef(-1);
  const [interceptedRequests, setInterceptedRequests] = useState({});

  const forceUpdateTimeout = useRef();

  useEffect(() => {
    chrome.runtime.onMessage.addListener(({ type, to, url, match }) => {
      if (type === 'ajaxInterceptor' && to === 'iframe') {
        if (!interceptedRequests[match]) interceptedRequests[match] = [];

        const exits = interceptedRequests[match].some((obj) => {
          if (obj.url === url) {
            obj.num++;
            return true;
          }
          return false;
        });

        if (!exits) {
          interceptedRequests[match].push({ url, num: 1 });
        }
        setInterceptedRequests(interceptedRequests);
        if (!exits) {
          // 新增的拦截的url，会多展示一行url，需要重新计算高度
          updateAddBtnTop_interval();
        }
      }
    });
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'ajaxInterceptor',
      to: 'background',
      iframeScriptLoaded: true,
    });
  }, []);

  useEffect(() => {
    updateAddBtnTop_interval();
  }, [interceptedRequests]);

  const updateAddBtnTop = () => {
    let curCollapseWrapperHeight = collapseWrapperRef.current
      ? collapseWrapperRef.current.offsetHeight
      : 0;
    if (collapseWrapperHeight.current !== curCollapseWrapperHeight) {
      collapseWrapperHeight.current = curCollapseWrapperHeight;
      clearTimeout(updateAddBtnTopDebounceTimeout.current);
      updateAddBtnTopDebounceTimeout.current = setTimeout(() => {
        addBtnRef.current.style.top = `${curCollapseWrapperHeight + 30}px`;
      }, 50);
    }
  };

  const updateAddBtnTop_interval = ({ timeout = 1000, interval = 50 } = {}) => {
    const i = setInterval(updateAddBtnTop, interval);
    setTimeout(() => {
      clearInterval(i);
    }, timeout);
  };
  const set = (key, value) => {
    // 发送给background.js
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'ajaxInterceptor',
      to: 'background',
      key,
      value,
    });
    chrome.storage && chrome.storage.local.set({ [key]: value });
  };

  const forceUpdateDebounce = () => {
    clearTimeout(forceUpdateTimeout.current);
    forceUpdateTimeout.current = setTimeout(() => {
      forceUpdate();
    }, 1000);
  };

  const handleSingleSwitchChange = (switchOn, i) => {
    window.setting.ajaxInterceptor_rules[i].switchOn = switchOn;
    set('ajaxInterceptor_rules', window.setting.ajaxInterceptor_rules);

    // 这么搞主要是为了能实时同步window.setting.ajaxInterceptor_rules，并且让性能好一点
    forceUpdateDebounce();
  };

  const handleFilterTypeChange = (val, i) => {
    window.setting.ajaxInterceptor_rules[i].filterType = val;
    set('ajaxInterceptor_rules', window.setting.ajaxInterceptor_rules);

    forceUpdate();
  };

  const handleMatchChange = (e, i) => {
    window.setting.ajaxInterceptor_rules[i].match = e.target.value;
    set('ajaxInterceptor_rules', window.setting.ajaxInterceptor_rules);

    forceUpdateDebounce();
  };

  const handleLabelChange = (e, i) => {
    window.setting.ajaxInterceptor_rules[i].label = e.target.value;
    set('ajaxInterceptor_rules', window.setting.ajaxInterceptor_rules);

    forceUpdateDebounce();
  };

  const handleClickAdd = () => {
    window.setting.ajaxInterceptor_rules.push({
      match: '',
      label: `url${window.setting.ajaxInterceptor_rules.length + 1}`,
      switchOn: true,
      key: buildUUID(),
    });
    forceUpdate(updateAddBtnTop_interval);
  };

  const handleClickRemove = (e, i) => {
    e.stopPropagation();
    const match = window.setting.ajaxInterceptor_rules[i].match;
    const label = window.setting.ajaxInterceptor_rules[i].label;

    window.setting.ajaxInterceptor_rules = [
      ...window.setting.ajaxInterceptor_rules.slice(0, i),
      ...window.setting.ajaxInterceptor_rules.slice(i + 1),
    ];
    set('ajaxInterceptor_rules', window.setting.ajaxInterceptor_rules);

    delete interceptedRequests[match];
    delete interceptedRequests[label];
    setInterceptedRequests(interceptedRequests);
  };

  const handleCollaseChange = () => {
    updateAddBtnTop_interval();
  };

  const handleSwitchChange = () => {
    window.setting.ajaxInterceptor_switchOn =
      !window.setting.ajaxInterceptor_switchOn;
    set('ajaxInterceptor_switchOn', window.setting.ajaxInterceptor_switchOn);

    forceUpdate();
  };

  return (
    <>
      <div className="main">
        <Switch
          style={{ zIndex: 10 }}
          defaultChecked={window.setting.ajaxInterceptor_switchOn}
          onChange={handleSwitchChange}
        />
        <div
          className={
            window.setting.ajaxInterceptor_switchOn
              ? 'settingBody'
              : 'settingBody settingBody-hidden'
          }
        >
          {window.setting.ajaxInterceptor_rules &&
          window.setting.ajaxInterceptor_rules.length > 0 ? (
            <div ref={collapseWrapperRef}>
              <Collapse
                className={
                  window.setting.ajaxInterceptor_switchOn
                    ? 'collapse'
                    : 'collapse collapse-hidden'
                }
                onChange={handleCollaseChange}
              >
                {window.setting.ajaxInterceptor_rules.map(
                  (
                    {
                      filterType = 'normal',
                      match,
                      label,
                      overrideTxt,
                      switchOn = true,
                      key,
                    },
                    i
                  ) => (
                    <Panel
                      key={key}
                      header={
                        <div
                          className="panel-header"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Space.Compact compact style={{ width: '78%' }}>
                            <Input
                              placeholder="name"
                              style={{ width: '21%' }}
                              defaultValue={label}
                              onChange={(e) => handleLabelChange(e, i)}
                            />
                            <Select
                              defaultValue={filterType}
                              style={{ width: '30%' }}
                              onChange={(e) => handleFilterTypeChange(e, i)}
                            >
                              <Option value="normal">normal</Option>
                              <Option value="regex">regex</Option>
                            </Select>
                            <Input
                              placeholder={
                                filterType === 'normal'
                                  ? 'eg: abc/get'
                                  : 'eg: abc.*'
                              }
                              style={{ width: '49%' }}
                              defaultValue={match}
                              // onClick={e => e.stopPropagation()}
                              onChange={(e) => handleMatchChange(e, i)}
                            />
                          </Space.Compact>
                          <Switch
                            size="small"
                            defaultChecked={switchOn}
                            onChange={(val) => handleSingleSwitchChange(val, i)}
                          />
                          <Button
                            style={{ marginRight: '16px' }}
                            type="primary"
                            shape="circle"
                            icon={<MinusOutlined />}
                            size="small"
                            onClick={(e) => handleClickRemove(e, i)}
                          />
                        </div>
                      }
                    >
                      <Replacer
                        defaultValue={overrideTxt}
                        updateAddBtnTop={updateAddBtnTop}
                        index={i}
                        set={set}
                      />
                      {interceptedRequests[match] && (
                        <>
                          <div className="intercepted-requests">
                            Intercepted Requests:
                          </div>
                          <div className="intercepted">
                            {interceptedRequests[match] &&
                              interceptedRequests[match].map(({ url, num }) => (
                                <Tooltip placement="top" title={url} key={url}>
                                  <Badge
                                    count={num}
                                    style={{
                                      backgroundColor: '#fff',
                                      color: '#999',
                                      boxShadow: '0 0 0 1px #d9d9d9 inset',
                                      marginTop: '-3px',
                                      marginRight: '4px',
                                    }}
                                  />
                                  <span className="url">{url}</span>
                                </Tooltip>
                              ))}
                          </div>
                        </>
                      )}
                    </Panel>
                  )
                )}
              </Collapse>
            </div>
          ) : (
            <div />
          )}
          <div ref={addBtnRef} className="wrapper-btn-add">
            <Button
              className={`btn-add ${
                window.setting.ajaxInterceptor_switchOn ? '' : ' btn-add-hidden'
              }`}
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={handleClickAdd}
              disabled={!window.setting.ajaxInterceptor_switchOn}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
