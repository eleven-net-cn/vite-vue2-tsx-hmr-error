/**
 * Created on 2021-07-22
 */
export interface PuzzleAdminMerlinModuleInfo {
  config_url?: string
  event_key?: string
}
export interface PuzzleAdminMerlinEventInfoFlowListEntry {
  key?: string
  value?: number
}
export interface PuzzleAdminMerlinEventInfoModuleListEntry {
  key?: string
  value?: PuzzleAdminMerlinModuleInfo
}
export interface PuzzleAdminMerlinEventInfo {
  event_key?: string
  flow_list?: PuzzleAdminMerlinEventInfoFlowListEntry[]
  game_biz?: string
  module_list?: PuzzleAdminMerlinEventInfoModuleListEntry[]
  module_name?: string
}
export interface PuzzleAdminEventPublishInfo {
  ctime?: string
  env?: string
  event_id?: number
  id?: number
  mtime?: string
  opt_user?: string
  status?: string
  version?: number
}
export interface PuzzleAdminEventVersionInfo {
  ctime?: string
  event_id?: number
  user?: string
  version?: number
}
export interface PuzzleAdminModuleInfo {
  ctime?: string
  game_biz?: string[] // type: string;关联业务
  id?: number // type: int32;id
  is_h5?: boolean // type: bool;支持移动端
  is_pc?: boolean // type: bool;支持pc
  is_publish?: boolean // type: bool;是否已发布
  module_desc?: string // type: string;描述
  module_icon?: string // type: string;组件icon
  module_name?: string // type: string;唯一名称
  module_type?: string
  module_ver?: string // type: string;正式版本
  module_ver_dev?: string // type: string;测试版本
  mtime?: string
  show_name?: string // type: string;中文名称
  status?: number // type: int32;状态 1为可用 0为不可用
}
export interface PuzzleAdminAddBEModuleReply {
  list?: PuzzleAdminMerlinEventInfo[]
}
export interface PuzzleAdminAddEventReply {
  id?: number
}
export interface PuzzleAdminAddModuleReply {}
export interface PuzzleAdminAddTemplateReply {
  id?: number
}
export interface PuzzleAdminCheckMi18nStatusReply {
  complete?: number // type: uint32;已翻译数
  is_release?: boolean
  total?: number // type: uint32;总翻译数
}
export interface PuzzleAdminCopyEventReply {
  id?: number
}
export interface PuzzleAdminDelBEModuleReply {
  list?: PuzzleAdminMerlinEventInfo[]
}
export interface PuzzleAdminDeleteTemplateReply {}
export interface PuzzleAdminDisableModuleReply {}
export interface PuzzleAdminAuthUser {
  name_cn?: string // type: string;中文名
  name_en?: string // type: string;域账号
}
export interface PuzzleAdminTemplateInfo {
  cover?: string // type: string;模版封面
  creator?: string // type: string;创建人
  ctime?: string
  device_mode?: string // type: string;设备模式
  event_id?: number // type: int32;来源活动id
  game_biz?: string // type: string;游戏业务
  id?: number
  mobile_page_mode?: number // type: uint32;h5页面模式
  mtime?: string
  pc_page_mode?: number // type: uint32;pc页面模式
  screen_mode?: string // type: string;屏幕模式
  template_name?: string // type: string;活动名称
}
export interface PuzzleAdminEventInfo {
  biz_list?: string[] // type: string;业务列表
  creator?: string // type: string;创建人
  ctime?: string
  device_mode?: string // type: string;设备模式
  end_time?: string
  event_key?: string // type: string;活动唯一key
  event_name?: string // type: string;活动名称
  event_type?: string // type: string;活动类型
  game_biz?: string // type: string;游戏业务
  id?: number
  is_mi18n?: boolean // type: bool;是否多语言
  mi18n_key?: string // type: string;多语言key
  mobile_page_mode?: number // type: uint32;h5页面模式
  mtime?: string
  pc_page_mode?: number // type: uint32;pc页面模式
  publish_key?: string // type: string;发布hash key
  publish_version?: number // type: int32;已发布配置版本号
  release_status?: string // type: string;发布环境状态
  screen_mode?: string // type: string;屏幕模式
  start_time?: string
  update_status?: string // type: string;编辑状态
  user_list?: PuzzleAdminAuthUser[] // 授权用户列表
  version?: number // type: int32;当前配置版本号
}
export interface PuzzleAdminEventModuleInfo {
  ctime?: string
  id?: number // type: int32;id
  is_h5?: boolean // type: bool;支持移动端
  is_pc?: boolean // type: bool;支持pc
  module_desc?: string // type: string;描述
  module_icon?: string // type: string;组件icon
  module_name?: string // type: string;唯一名称
  module_type?: string
  module_ver?: string // type: string;版本
  mtime?: string
  show_name?: string // type: string;中文名称
}
export interface PuzzleAdminGetBEModuleInfoReply {
  list?: PuzzleAdminMerlinEventInfo[]
}
export interface PuzzleAdminGetEventAuthReply {
  user_list?: PuzzleAdminAuthUser[]
}
export interface PuzzleAdminGetEventAuthTokenReply {
  token?: string
}
export interface PuzzleAdminGetEventBizReply {
  game_biz?: string[]
}
export interface PuzzleAdminGetEventInfoReply {
  biz_list?: string[]
  config_str?: string // type: string;配置信息
  creator?: string // type: string;创建人
  ctime?: string
  device_mode?: string // type: string;设备模式
  end_time?: string
  event_key?: string // type: string;活动唯一key
  event_name?: string // type: string;活动名称
  event_type?: string // type: string;活动类型
  game_biz?: string // type: string;游戏业务
  id?: number
  is_mi18n?: boolean // type: bool;是否多语言
  mi18n_key?: string // type: string;多语言key
  mobile_page_mode?: number // type: uint32;h5页面模式
  mtime?: string
  pc_page_mode?: number // type: uint32;pc页面模式
  publish_key?: string // type: string;发布hash key
  publish_version?: number // type: int32;已发布配置版本号
  release_status?: string // type: string;发布环境状态
  screen_mode?: string // type: string;屏幕模式
  start_time?: string
  template_list?: PuzzleAdminTemplateInfo[] // 关联模版列表
  update_status?: string // type: string;编辑状态
  user_list?: PuzzleAdminAuthUser[] // 授权用户列表
  version?: number // type: int32;当前配置版本号
}
export interface PuzzleAdminGetEventListReply {
  count?: number
  list?: PuzzleAdminEventInfo[]
}
export interface PuzzleAdminGetEventModuleListReply {
  count?: number
  list?: PuzzleAdminEventModuleInfo[]
}
export interface PuzzleAdminGetEventPublishInfoReply {
  ctime?: string
  env?: string
  event_id?: number
  id?: number
  mtime?: string
  opt_user?: string
  package_info?: string // type: string;打包控制台输出信息
  status?: string
  version?: number
}
export interface PuzzleAdminGetEventPublishListReply {
  count?: number
  list?: PuzzleAdminEventPublishInfo[]
}
export interface PuzzleAdminGetEventVersionDiffReply {
  last_config?: string
  now_config?: string
}
export interface PuzzleAdminGetEventVersionListReply {
  count?: number
  list?: PuzzleAdminEventVersionInfo[]
}
export interface PuzzleAdminGetModuleInfoReply {
  info?: PuzzleAdminModuleInfo
}
export interface PuzzleAdminGetModuleListReply {
  count?: number
  list?: PuzzleAdminModuleInfo[]
}
export interface PuzzleAdminGetTemplateInfoReply {
  config_str?: string // type: string;模版配置
  cover?: string // type: string;模版封面
  creator?: string // type: string;创建人
  ctime?: string
  device_mode?: string // type: string;设备模式
  event_id?: number // type: int32;来源活动id
  game_biz?: string // type: string;游戏业务
  id?: number
  mobile_page_mode?: number // type: uint32;h5页面模式
  mtime?: string
  pc_page_mode?: number // type: uint32;pc页面模式
  screen_mode?: string // type: string;屏幕模式
  template_name?: string // type: string;活动名称
}
export interface PuzzleAdminGetTemplateListReply {
  count?: number
  list?: PuzzleAdminTemplateInfo[]
}
export interface PuzzleAdminPublishEventReply {
  id?: number
}
export interface PuzzleAdminPublishModuleReply {}
export interface PuzzleAdminRollbackEventPublishReply {}
export interface PuzzleAdminRollbackEventVersionReply {}
export interface PuzzleAdminSetEventAuthReply {}
export interface PuzzleAdminSetEventBizReply {}
export interface PuzzleAdminUpdateEventReply {}
export interface PuzzleAdminUpdateEventConfigReply {}
export interface PuzzleAdminUpdateMi18nReply {
  mi18n_key?: string // type: string;多语言key
}
export interface PuzzleAdminUpdateModuleReply {}
export interface PuzzleAdminUpdateTemplateReply {}
export interface PuzzleAdminUpdateTemplateConfigReply {}

export interface ResultVO<T> {
  retcode?: number
  data?: T
  message?: string
  success?: boolean
}
