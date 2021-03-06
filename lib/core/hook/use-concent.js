"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.useConcentForOb = useConcentForOb;
exports["default"] = void 0;

var React = _interopRequireWildcard(require("react"));

var _constant = require("../../support/constant");

var _privConstant = require("../../support/priv-constant");

var _buildRefCtx = _interopRequireDefault(require("../ref/build-ref-ctx"));

var _ccContext = _interopRequireDefault(require("../../cc-context"));

var _mapRegistrationInfo2 = _interopRequireDefault(require("../base/map-registration-info"));

var _beforeMount = _interopRequireDefault(require("../base/before-mount"));

var _didMount = _interopRequireDefault(require("../base/did-mount"));

var _didUpdate = _interopRequireDefault(require("../base/did-update"));

var _beforeUnmount = _interopRequireDefault(require("../base/before-unmount"));

var hf = _interopRequireWildcard(require("../state/handler-factory"));

var _util = require("../../support/util");

var _beforeRender = _interopRequireDefault(require("../ref/before-render"));

var _isRegChanged = _interopRequireDefault(require("../param/is-reg-changed"));

var _isStrict = _interopRequireDefault(require("./is-strict"));

/**
 * http://react.html.cn/docs/strict-mode.html
 * https://frontarm.com/daishi-kato/use-ref-in-concurrent-mode/
 */
var ccUKey_ref_ = _ccContext["default"].ccUKey_ref_;
var cursor_hookCtx_ = {};
var refCursor = 1;

function getUsableCursor() {
  var toReturn = refCursor;
  return toReturn;
}

function incCursor() {
  refCursor = refCursor + 1;
}

function CcHook(state, hookSetter, props, hookCtx) {
  //new CcHook时，这里锁定的hookSetter就是后面一直可以用的setter
  //如果存在期一直替换hookSetter，反倒会造成打开react-dev-tool，点击面板里的dom后，视图便不再更新的bug
  this.setState = hookSetter;
  this.forceUpdate = hookSetter;
  this.state = state;
  this.isFirstRendered = true;
  this.props = props;
  this.hookCtx = hookCtx;
} // rState: resolvedState, iState: initialState


function buildRef(ref, insType, hookCtx, rState, iState, regOpt, hookState, hookSetter, props, extra, ccClassKey) {
  incCursor();
  cursor_hookCtx_[hookCtx.cursor] = hookCtx; // when single file demo in hmr mode trigger buildRef, rState is 0 
  // so here call evalState again

  var state = rState || (0, _util.evalState)(iState);
  var bindCtxToMethod = regOpt.bindCtxToMethod;
  var renderKeyClasses = regOpt.renderKeyClasses,
      module = regOpt.module,
      _regOpt$watchedKeys = regOpt.watchedKeys,
      watchedKeys = _regOpt$watchedKeys === void 0 ? '-' : _regOpt$watchedKeys,
      _regOpt$connect = regOpt.connect,
      connect = _regOpt$connect === void 0 ? {} : _regOpt$connect,
      setup = regOpt.setup,
      lite = regOpt.lite;

  var _mapRegistrationInfo = (0, _mapRegistrationInfo2["default"])(module, ccClassKey, renderKeyClasses, _constant.CC_HOOK, watchedKeys, connect, true),
      _module = _mapRegistrationInfo._module,
      _ccClassKey = _mapRegistrationInfo._ccClassKey,
      _connect = _mapRegistrationInfo._connect,
      _watchedKeys = _mapRegistrationInfo._watchedKeys;

  var hookRef = ref || new CcHook(hookState, hookSetter, props, hookCtx);
  hookCtx.hookRef = hookRef;
  var params = Object.assign({}, regOpt, {
    module: _module,
    watchedKeys: _watchedKeys,
    state: state,
    type: _constant.CC_HOOK,
    insType: insType,
    extra: extra,
    ccClassKey: _ccClassKey,
    connect: _connect,
    ccOption: props.ccOption,
    id: props.id,
    ccKey: props.ccKey
  });
  hookRef.props = props; // keep shape same as class

  (0, _buildRefCtx["default"])(hookRef, params, lite); // in buildRefCtx cc will assign hookRef.props to ctx.prevProps

  hookRef.ctx.reactSetState = hf.makeRefSetState(hookRef);
  hookRef.ctx.reactForceUpdate = hf.makeRefForceUpdate(hookRef);
  var refCtx = hookRef.ctx;
  refCtx.props = props; // attach props to ctx

  (0, _beforeMount["default"])(hookRef, setup, bindCtxToMethod); // cursor_refKey_[cursor] = hookRef.ctx.ccUniqueKey;

  hookCtx.prevCcUKey = hookCtx.ccUKey;
  hookCtx.ccUKey = hookRef.ctx.ccUniqueKey; // rewrite useRef for CcHook

  refCtx.useRef = function useR(refName) {
    //give named function to avoid eslint error
    var ref = React.useRef(null);
    refCtx.refs[refName] = ref;
    return ref;
  };

  return hookRef;
}

function replaceSetter(ctx, hookSetter) {
  ctx.__boundSetState = hookSetter;
  ctx.__boundForceUpdate = hookSetter;
}

function getHookCtxCcUKey(hookCtx) {
  return hookCtx.prevCcUKey || hookCtx.ccUKey;
}

var tip = 'react version is LTE 16.8';

function _useConcent(registerOption, ccClassKey, insType) {
  if (registerOption === void 0) {
    registerOption = {};
  }

  var cursor = getUsableCursor();

  var _registerOption = (0, _util.getRegisterOptions)(registerOption); // ef: effectFlag


  var hookCtxContainer = React.useRef({
    cursor: cursor,
    prevCcUKey: null,
    ccUKey: null,
    regOpt: _registerOption,
    ef: 0
  });
  var hookCtx = hookCtxContainer.current; // here not allow user pass extra as undefined, it will been given value {} implicitly if pass undefined!!!

  var _registerOption$state = _registerOption.state,
      iState = _registerOption$state === void 0 ? {} : _registerOption$state,
      _registerOption$props = _registerOption.props,
      props = _registerOption$props === void 0 ? {} : _registerOption$props,
      mapProps = _registerOption.mapProps,
      _registerOption$layou = _registerOption.layoutEffect,
      layoutEffect = _registerOption$layou === void 0 ? false : _registerOption$layou,
      _registerOption$extra = _registerOption.extra,
      extra = _registerOption$extra === void 0 ? {} : _registerOption$extra;
  var reactUseState = React.useState;

  if (!reactUseState) {
    throw new Error(tip);
  }

  var isFirstRendered = cursor === hookCtx.cursor;
  var state = isFirstRendered ? (0, _util.evalState)(iState) : 0;

  var _reactUseState = reactUseState(state),
      hookState = _reactUseState[0],
      hookSetter = _reactUseState[1];

  var cref = function cref(ref) {
    return buildRef(ref, insType, hookCtx, state, iState, _registerOption, hookState, hookSetter, props, extra, ccClassKey);
  };

  var hookRef; // 组件刚挂载 or 渲染过程中变化module或者connect的值，触发创建新ref

  if (isFirstRendered || (0, _isRegChanged["default"])(hookCtx.regOpt, _registerOption, true)) {
    hookCtx.regOpt = _registerOption;
    hookRef = cref();
  } else {
    hookRef = ccUKey_ref_[hookCtx.ccUKey];

    if (!hookRef) {
      // single file demo in hot reload mode
      hookRef = cref();
    } else {
      var _refCtx = hookRef.ctx;
      _refCtx.prevProps = _refCtx.props;
      hookRef.props = _refCtx.props = props;
      _refCtx.extra = extra;
    }
  }

  var refCtx = hookRef.ctx;
  var effectHandler = layoutEffect ? React.useLayoutEffect : React.useEffect; // after first render of hookRef just created 

  effectHandler(function () {
    var hookCtx = hookRef.hookCtx;
    hookCtx.ef = 1; // 辅助非StrictMode包裹的区域，在随后的判断里可以逃出被删除逻辑
    // mock componentWillUnmount

    return function () {
      var toUnmountRef = ccUKey_ref_[getHookCtxCcUKey(hookCtx)];
      hookCtx.prevCcUKey = null;

      if (toUnmountRef) {
        (0, _beforeUnmount["default"])(toUnmountRef);
      }

      delete cursor_hookCtx_[cursor];
    };
  }, [hookRef]); // 渲染过程中变化module或者connect的值，触发卸载前一刻的ref
  //after every render

  effectHandler(function () {
    replaceSetter(refCtx, hookSetter); // 热加载模式下会触发卸载，这里需要核实ccUKey_ref_

    if (!hookRef.isFirstRendered && ccUKey_ref_[getHookCtxCcUKey(hookCtx)]) {
      // mock componentDidUpdate
      (0, _didUpdate["default"])(hookRef);
    } else {
      // mock componentDidMount
      hookRef.isFirstRendered = false;
      (0, _didMount["default"])(hookRef);
    } // dobule-invoking 机制导致初始化阶段生成了一个多余的hookRef
    // 虽然未存储到refs上，但是收集到的依赖存储到了waKey_uKeyMap_上
    // 这里通过触发beforeUnmount来清理多余的依赖


    var cursor = hookCtx.cursor;

    if ((0, _isStrict["default"])(cursor) && !hookCtx.clearPrev) {
      hookCtx.clearPrev = true;
      var prevCursor = cursor - 1;
      var prevHookCtx = cursor_hookCtx_[prevCursor];

      if (prevHookCtx && prevHookCtx.ef === 0) {
        // 确保是同一个类型的实例
        if (prevHookCtx.hookRef.ctx.ccClassKey === hookCtx.hookRef.ctx.ccClassKey) {
          delete cursor_hookCtx_[prevCursor]; // 让来自于concent的渲染通知只触发一次, 注意prevHookRef没有被重复触发过diMount逻辑
          // 所以直接用prevHookCtx.hookRef来执行beforeUnmount

          (0, _beforeUnmount["default"])(prevHookCtx.hookRef);
        }
      }
    }
  });
  (0, _beforeRender["default"])(hookRef); // before every render

  if (mapProps) {
    var mapped = mapProps(refCtx);

    if (!(0, _util.isPJO)(mapped)) {
      throw new Error("mapProps ret " + _privConstant.NOT_A_JSON);
    }

    refCtx.mapped = mapped;
  }

  return refCtx;
}
/**
 * 仅供内部 component/Ob 调用
 */


function useConcentForOb(registerOption, ccClassKey) {
  // 只针对Ob组件实例化检查时，reg参数是否已变化
  return _useConcent(registerOption, ccClassKey, _constant.CC_OB);
} //写为具名函数，防止react-dev-tool里显示.default


function useConcent(registerOption, ccClassKey) {
  return _useConcent(registerOption, ccClassKey, _constant.CC_CUSTOMIZE);
}

var _default = useConcent;
exports["default"] = _default;