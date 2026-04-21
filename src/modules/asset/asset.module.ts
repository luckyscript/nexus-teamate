import { Configuration } from '@midwayjs/core';
import { SkillEntity } from './entity/skill.entity';
import { CapsuleEntity } from './entity/capsule.entity';
import { TemplateEntity } from './entity/template.entity';
import { AssetBindingEntity } from './entity/asset-binding.entity';
import { AssetController } from './controller/asset.controller';

@Configuration({
  namespace: 'asset',
})
export class AssetModuleConfiguration {
  static entities = [
    SkillEntity,
    CapsuleEntity,
    TemplateEntity,
    AssetBindingEntity,
  ];
  static controllers = [AssetController];
}
